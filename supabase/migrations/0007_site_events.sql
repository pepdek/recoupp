-- Privacy-friendly funnel counters for the public site: a name and a page path. No ids, no answers, no cookies.
create table site_events (
  id bigint generated always as identity primary key,
  name text not null check (name in ('page_view','cta_click','check_start','check_complete','checkout_start')),
  page text not null check (length(page) <= 80),
  at timestamptz not null default now()
);
alter table site_events enable row level security; -- no policies: written and read only through the functions below

create function log_site_event(p_name text, p_page text) returns void language sql security definer set search_path = public as $$
  insert into site_events (name, page) values (p_name, left(regexp_replace(coalesce(p_page, ''), '[?#].*$', ''), 80))
$$;
grant execute on function log_site_event(text, text) to anon, authenticated;

create function site_funnel(p_days int default 30) returns table (name text, events bigint) language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'admin only'; end if;
  return query select e.name, count(*) from site_events e where e.at > now() - make_interval(days => p_days) group by e.name order by 2 desc;
end $$;
revoke execute on function site_funnel(int) from public, anon;
grant execute on function site_funnel(int) to authenticated;
