-- Staff accounts are decided by email allow-list, applied when the profile is created (magic link proves the email).
create table staff_emails (email text primary key, role text not null check (role in ('admin','reviewer')));
alter table staff_emails enable row level security; -- no policies: service role / SQL only
insert into staff_emails values ('dekpep@gmail.com', 'admin');

create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, role)
  values (new.id, coalesce((select role from staff_emails where lower(email) = lower(new.email)), 'household'));
  return new;
end $$;
revoke execute on function handle_new_user() from public, anon, authenticated;

create table evaluations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households on delete cascade,
  program_id text not null,
  program_version text not null,
  status text not null check (status in ('eligible','likely','unlikely','needs_human_review','already_receiving')),
  rule_id text not null,
  reason text not null,
  value jsonb,
  confidence text not null check (confidence in ('verified','needs_review')),
  review_state text not null default 'pending' check (review_state in ('pending','approved','rejected','escalated')),
  override_status text check (override_status in ('eligible','likely','unlikely')),
  override_value_likely numeric check (override_value_likely >= 0),
  reviewer_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (household_id, program_id)
);
alter table evaluations enable row level security;
create policy ev_staff_all on evaluations for all using (is_staff()) with check (is_staff());
-- Households see only approved rows, and only once the whole household review is signed off.
create policy ev_owner_select on evaluations for select using (
  review_state = 'approved' and owns_household(household_id)
  and exists (select 1 from households h where h.id = household_id and h.reviewed_at is not null)
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households on delete cascade,
  reviewer_id uuid not null,
  decision text not null check (decision in ('approved','escalated')),
  notes text,
  seconds_spent int not null check (seconds_spent between 0 and 7200),
  created_at timestamptz not null default now()
);
alter table reviews enable row level security;
create policy rv_staff_select on reviews for select using (is_staff());
create policy rv_staff_insert on reviews for insert with check (is_staff() and reviewer_id = auth.uid());

create table claims (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households on delete cascade,
  evaluation_id uuid references evaluations on delete set null,
  program_id text not null,
  status text not null default 'recommended' check (status in ('recommended','prepared','submitted','pending','approved','denied','needs_info','receiving','renewal_due')),
  renewal_due date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, program_id)
);
alter table claims enable row level security;
create policy cl_select on claims for select using (owns_household(household_id) or is_staff());
create policy cl_staff_insert on claims for insert with check (is_staff());
create policy cl_update on claims for update using (owns_household(household_id) or is_staff()) with check (owns_household(household_id) or is_staff());

create function claims_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not is_staff() and (
       old.status not in ('recommended','prepared') or new.status not in ('prepared','submitted')
       or new.household_id <> old.household_id or new.program_id <> old.program_id
       or new.evaluation_id is distinct from old.evaluation_id or new.renewal_due is distinct from old.renewal_due) then
    raise exception 'status change not allowed';
  end if;
  new.updated_at := now();
  if new.status is distinct from old.status then
    insert into audit_log (actor, action, entity, entity_id, detail)
    values (auth.uid(), 'claim.status', 'claim', new.id::text, jsonb_build_object('from', old.status, 'to', new.status));
  end if;
  return new;
end $$;
revoke execute on function claims_guard() from public, anon, authenticated;
create trigger claims_guard_t before update on claims for each row execute function claims_guard();

-- Append-only outcome ledger. No foreign keys on purpose: entries hold no PII and survive a household deletion
-- (needed for sponsor guarantee reporting); a deletion cascade would otherwise be blocked by the append-only trigger.
-- "Verified" = approved with a determination letter, or received with confirmed receipt, each with an uploaded
-- evidence document and the staff member who checked it.
create table ledger_entries (
  id uuid primary key default gen_random_uuid(),
  org_id uuid,
  household_id uuid not null,
  claim_id uuid not null,
  program_id text not null,
  kind text not null check (kind in ('estimated','approved','received')),
  annual_value numeric not null check (annual_value >= 0),
  effective_date date,
  verified_basis text check (verified_basis in ('determination_letter','confirmed_receipt')),
  evidence_document_id uuid,
  verified_by uuid,
  note text,
  created_at timestamptz not null default now(),
  constraint verified_has_proof check (kind = 'estimated' or (verified_basis is not null and evidence_document_id is not null and verified_by is not null)),
  constraint basis_matches_kind check (kind = 'estimated' or (kind = 'approved' and verified_basis = 'determination_letter') or (kind = 'received' and verified_basis = 'confirmed_receipt'))
);
create index on ledger_entries (claim_id);
create index on ledger_entries (org_id);
create trigger ledger_append_only before update or delete on ledger_entries for each row execute function reject_mutation();
alter table ledger_entries enable row level security;
create policy le_select on ledger_entries for select using (owns_household(household_id) or is_staff());
create policy le_staff_insert on ledger_entries for insert with check (is_staff() and (kind = 'estimated' or verified_by = auth.uid()));

create function approve_household(hid uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_staff() then raise exception 'staff only'; end if;
  if not exists (select 1 from evaluations where household_id = hid) then raise exception 'no evaluations'; end if;
  if exists (select 1 from evaluations where household_id = hid and review_state in ('pending','escalated')) then raise exception 'undecided evaluations'; end if;
  update households set reviewed_at = now(), reviewed_by = auth.uid() where id = hid and status = 'completed';
  insert into audit_log (actor, action, entity, entity_id) values (auth.uid(), 'household.review_approved', 'household', hid::text);
end $$;
revoke execute on function approve_household(uuid) from public, anon;
grant execute on function approve_household(uuid) to authenticated;
