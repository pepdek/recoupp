create function is_staff() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('admin','reviewer'))
$$;
revoke execute on function is_staff() from public, anon;
grant execute on function is_staff() to authenticated;

create table households (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users on delete cascade,
  org_id uuid references organizations,
  relationship text not null default 'self' check (relationship in ('self','family','caseworker','other')),
  county text,
  city text,
  answers jsonb not null default '{}',
  step text not null default 'members',
  status text not null default 'in_progress' check (status in ('in_progress','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on households (owner_id);

create table household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households on delete cascade,
  first_name text not null,
  birth_year int not null check (birth_year between 1900 and 2100),
  is_primary boolean not null default false,
  veteran boolean not null default false,
  disabled boolean not null default false,
  created_at timestamptz not null default now()
);
create index on household_members (household_id);

create table consents (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households on delete cascade,
  user_id uuid not null,
  version text not null,
  share_with_org boolean not null default false,
  org_id uuid references organizations,
  accepted_at timestamptz not null default now()
);
create index on consents (household_id);
create trigger consents_no_update before update on consents for each row execute function reject_mutation();

create function owns_household(hid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from households where id = hid and owner_id = auth.uid())
$$;
revoke execute on function owns_household(uuid) from public, anon;
grant execute on function owns_household(uuid) to authenticated;

alter table households enable row level security;
alter table household_members enable row level security;
alter table consents enable row level security;

create policy hh_select on households for select using (owner_id = auth.uid() or is_staff());
create policy hh_insert on households for insert with check (owner_id = auth.uid() and org_id is null);
create policy hh_update on households for update using (owner_id = auth.uid() or is_staff()) with check (owner_id = auth.uid() or is_staff());
create policy hh_delete on households for delete using (owner_id = auth.uid());
-- owner/org cannot be reassigned by clients
revoke update on households from authenticated;
grant update (relationship, county, city, answers, step, status, updated_at) on households to authenticated;

create policy mem_select on household_members for select using (owns_household(household_id) or is_staff());
create policy mem_write on household_members for all using (owns_household(household_id)) with check (owns_household(household_id));

create policy con_select on consents for select using (owns_household(household_id) or is_staff());
create policy con_insert on consents for insert with check (owns_household(household_id) and user_id = auth.uid() and org_id is null);

-- Clients log through this so actor is always the caller; audit_log itself stays closed.
create function log_event(p_action text, p_entity text, p_entity_id text, p_detail jsonb default null) returns void
language sql security definer set search_path = public as $$
  insert into audit_log (actor, action, entity, entity_id, detail) values (auth.uid(), p_action, p_entity, p_entity_id, p_detail)
$$;
revoke execute on function log_event(text, text, text, jsonb) from public, anon;
grant execute on function log_event(text, text, text, jsonb) to authenticated;
