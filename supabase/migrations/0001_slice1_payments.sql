create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  fee_cents int not null default 9900,
  min_households int not null default 100,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'household' check (role in ('admin','reviewer','sponsor_viewer','household')),
  org_id uuid references organizations,
  created_at timestamptz not null default now()
);
create table payments (
  id uuid primary key default gen_random_uuid(),
  stripe_object_id text not null unique,
  offer text not null check (offer in ('A','B')),
  org_id uuid references organizations,
  email text,
  amount_cents int not null,
  currency text not null default 'usd',
  status text not null check (status in ('paid','refunded','partially_refunded')),
  refunded_cents int not null default 0,
  stripe_payment_intent text,
  created_at timestamptz not null default now()
);
create index on payments (stripe_payment_intent);
create table stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);
create table audit_log (
  id bigint generated always as identity primary key,
  actor uuid,
  action text not null,
  entity text not null,
  entity_id text,
  detail jsonb,
  at timestamptz not null default now()
);
create function reject_mutation() returns trigger language plpgsql set search_path = public as $$ begin raise exception 'append-only table'; end $$;
create trigger audit_log_append_only before update or delete on audit_log for each row execute function reject_mutation();

create function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;
create function my_org() returns uuid language sql stable security definer set search_path = public as $$
  select org_id from profiles where id = auth.uid()
$$;

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table payments enable row level security;
alter table stripe_events enable row level security;
alter table audit_log enable row level security;

create policy org_read on organizations for select using (is_admin() or id = my_org());
create policy org_admin_write on organizations for all using (is_admin()) with check (is_admin());
create policy profile_self on profiles for select using (id = auth.uid() or is_admin());
create policy profile_admin_write on profiles for all using (is_admin()) with check (is_admin());
create policy pay_read on payments for select using (
  is_admin()
  or (org_id is not null and org_id = my_org())
  or lower(email) = lower(auth.jwt() ->> 'email')
);
create policy audit_admin_read on audit_log for select using (is_admin());
-- stripe_events: no policies = service role only.

create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into profiles (id) values (new.id); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

revoke execute on function handle_new_user() from public, anon, authenticated;
revoke execute on function is_admin() from public, anon;
revoke execute on function my_org() from public, anon;
grant execute on function is_admin() to authenticated;
grant execute on function my_org() to authenticated;
