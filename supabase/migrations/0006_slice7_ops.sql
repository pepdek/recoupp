-- Reminder send log. Written only by the cron route with the service role; one row per (claim, kind, bucket).
create table reminder_log (
  id bigint generated always as identity primary key,
  claim_id uuid not null references claims on delete cascade,
  kind text not null check (kind in ('docs_missing','needs_info','renewal_30','renewal_7')),
  dedupe_key text not null unique,
  sent_at timestamptz not null default now()
);
alter table reminder_log enable row level security; -- no policies

-- Admin-only inputs for the kill-criteria dashboard. Dollar rates (reviewer wage, API prices) are applied in the app.
create function kill_metrics() returns jsonb language plpgsql stable security definer set search_path = public as $$
declare res jsonb;
begin
  if not is_admin() then raise exception 'admin only'; end if;
  select jsonb_build_object(
    'claims_total', (select count(*) from claims),
    'claims_completed', (select count(*) from claims where status not in ('recommended','prepared')),
    'revenue_cents', coalesce((select sum(amount_cents - refunded_cents) from payments), 0),
    'reviewer_seconds', coalesce((select sum(seconds_spent) from reviews), 0),
    'reviewed_households', (select count(distinct household_id) from reviews where decision = 'approved'),
    'extract_input_tokens', coalesce((select sum((extraction_usage->>'input_tokens')::bigint) from documents where extraction_usage is not null), 0),
    'extract_output_tokens', coalesce((select sum((extraction_usage->>'output_tokens')::bigint) from documents where extraction_usage is not null), 0),
    'orgs', coalesce((select jsonb_agg(jsonb_build_object(
        'name', o.name, 'fee_cents', o.fee_cents,
        'completed', (select count(*) from households h where h.org_id = o.id and h.status = 'completed'),
        'verified_total', coalesce((select sum(x.annual_value) from (select distinct on (le.claim_id) le.annual_value from ledger_entries le
            where le.org_id = o.id and le.kind in ('approved','received') order by le.claim_id, le.created_at desc, le.kind desc) x), 0)))
      from organizations o), '[]'::jsonb),
    'b2c', jsonb_build_object(
        'completed', (select count(*) from households where org_id is null and status = 'completed'),
        'verified_total', coalesce((select sum(x.annual_value) from (select distinct on (le.claim_id) le.annual_value from ledger_entries le
            where le.org_id is null and le.kind in ('approved','received') order by le.claim_id, le.created_at desc, le.kind desc) x), 0))
  ) into res;
  return res;
end $$;
revoke execute on function kill_metrics() from public, anon;
grant execute on function kill_metrics() to authenticated;
