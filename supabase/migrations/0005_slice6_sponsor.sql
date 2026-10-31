-- Sponsor viewers are provisioned like staff: allow-list row (with org) applied when the profile is first created.
alter table staff_emails drop constraint staff_emails_role_check;
alter table staff_emails add constraint staff_emails_role_check check (role in ('admin','reviewer','sponsor_viewer'));
alter table staff_emails add column org_id uuid references organizations;

create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare s staff_emails;
begin
  select * into s from staff_emails where lower(email) = lower(new.email);
  insert into profiles (id, role, org_id) values (new.id, coalesce(s.role, 'household'), s.org_id);
  return new;
end $$;
revoke execute on function handle_new_user() from public, anon, authenticated;

-- Anonymous funnel counter for the white-label link. Counts only; no identifiers.
create table events (
  id bigint generated always as identity primary key,
  org_id uuid not null references organizations,
  name text not null check (name in ('link_visit')),
  at timestamptz not null default now()
);
alter table events enable row level security; -- no policies: written/read through the functions below

create function log_visit(p_slug text) returns void language sql security definer set search_path = public as $$
  insert into events (org_id, name) select id, 'link_visit' from organizations where slug = p_slug
$$;
grant execute on function log_visit(text) to anon, authenticated;

create function org_public(p_slug text) returns table (name text, logo_url text) language sql stable security definer set search_path = public as $$
  select name, logo_url from organizations where slug = p_slug
$$;
grant execute on function org_public(text) to anon, authenticated;

-- The only way a household gets an org: consent and org link are written together, server-side.
create function create_household(p_relationship text, p_org_slug text, p_consent_version text, p_share boolean) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_org uuid; v_h uuid;
begin
  if auth.uid() is null then raise exception 'login required'; end if;
  if coalesce(p_org_slug, '') <> '' then
    select id into v_org from organizations where slug = p_org_slug;
    if v_org is null then raise exception 'unknown organization'; end if;
  end if;
  insert into households (owner_id, org_id, relationship) values (auth.uid(), v_org, p_relationship) returning id into v_h;
  insert into consents (household_id, user_id, version, share_with_org, org_id)
  values (v_h, auth.uid(), p_consent_version, coalesce(p_share, false) and v_org is not null, v_org);
  insert into audit_log (actor, action, entity, entity_id, detail)
  values (auth.uid(), 'consent.accepted', 'household', v_h::text, jsonb_build_object('version', p_consent_version, 'relationship', p_relationship, 'org', v_org is not null, 'share', coalesce(p_share, false) and v_org is not null));
  return v_h;
end $$;
revoke execute on function create_household(text, text, text, boolean) from public, anon;
grant execute on function create_household(text, text, text, boolean) to authenticated;

create function can_view_org(p_org uuid) returns boolean language sql stable security definer set search_path = public as $$
  select is_staff() or exists (select 1 from profiles where id = auth.uid() and role = 'sponsor_viewer' and org_id = p_org)
$$;
revoke execute on function can_view_org(uuid) from public, anon;
grant execute on function can_view_org(uuid) to authenticated;

-- Aggregates only. Latest verified (approved/received) ledger entry per claim, same rule as lib/ledger.ts.
create function sponsor_stats(p_org uuid) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare o organizations; res jsonb;
begin
  if not can_view_org(p_org) then raise exception 'not allowed'; end if;
  select * into o from organizations where id = p_org;
  with hh as (select id, status, created_at from households where org_id = p_org),
  cl as (select c.id, c.household_id, c.program_id, c.status from claims c join hh on hh.id = c.household_id),
  latest as (select distinct on (claim_id) household_id, claim_id, annual_value from ledger_entries
             where org_id = p_org and kind in ('approved','received') order by claim_id, created_at desc, kind desc),
  est as (select distinct on (claim_id) claim_id, annual_value from ledger_entries
          where org_id = p_org and kind = 'estimated' order by claim_id, created_at desc),
  vh as (select household_id, sum(annual_value) v from latest group by household_id)
  select jsonb_build_object(
    'org', jsonb_build_object('id', o.id, 'name', o.name, 'slug', o.slug, 'fee_cents', o.fee_cents, 'min_households', o.min_households),
    'visits', (select count(*) from events where org_id = p_org and name = 'link_visit'),
    'started', (select count(*) from hh),
    'completed', (select count(*) from hh where status = 'completed'),
    'submitted', (select count(distinct household_id) from cl where status in ('submitted','pending','approved','denied','needs_info','receiving','renewal_due')),
    'approved', (select count(distinct household_id) from cl where status in ('approved','receiving','renewal_due')),
    'estimated_total', coalesce((select sum(annual_value) from est), 0),
    'verified_total', coalesce((select sum(annual_value) from latest), 0),
    'households_with_verified', (select count(*) from vh),
    'new_started_30d', (select count(*) from hh where created_at > now() - interval '30 days'),
    'verified_added_30d', coalesce((select sum(annual_value) from ledger_entries where org_id = p_org and kind in ('approved','received') and created_at > now() - interval '30 days'), 0),
    'fees_paid_cents', coalesce((select sum(amount_cents - refunded_cents) from payments where org_id = p_org and offer = 'A'), 0),
    'by_program', coalesce((select jsonb_agg(jsonb_build_object('program_id', program_id, 'claims', claims, 'verified_claims', vc, 'verified_value', vv))
                            from (select cl.program_id, count(*) claims, count(l.claim_id) vc, coalesce(sum(l.annual_value), 0) vv
                                  from cl left join latest l on l.claim_id = cl.id group by cl.program_id) t), '[]'::jsonb)
  ) into res;
  return res;
end $$;
revoke execute on function sponsor_stats(uuid) from public, anon;
grant execute on function sponsor_stats(uuid) to authenticated;

-- Individual rows only for households whose latest consent shares with this org. No names.
create function sponsor_shared_households(p_org uuid) returns table (household_id uuid, city text, status text, claims jsonb, verified numeric)
language plpgsql stable security definer set search_path = public as $$
begin
  if not can_view_org(p_org) then raise exception 'not allowed'; end if;
  return query
  select h.id, h.city, h.status,
    coalesce((select jsonb_agg(jsonb_build_object('program', c.program_id, 'status', c.status)) from claims c where c.household_id = h.id), '[]'::jsonb),
    coalesce((select sum(l.annual_value) from (select distinct on (le.claim_id) le.annual_value from ledger_entries le
              where le.household_id = h.id and le.kind in ('approved','received') order by le.claim_id, le.created_at desc, le.kind desc) l), 0)
  from households h
  where h.org_id = p_org
    and (select co.share_with_org from consents co where co.household_id = h.id order by co.accepted_at desc limit 1);
end $$;
revoke execute on function sponsor_shared_households(uuid) from public, anon;
grant execute on function sponsor_shared_households(uuid) to authenticated;
