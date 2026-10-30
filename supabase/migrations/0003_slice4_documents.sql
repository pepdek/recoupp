-- Reviewer sign-off gate: clients cannot write this column (update is column-granted, see 0002).
alter table households add column reviewed_at timestamptz, add column reviewed_by uuid;

create table documents (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households on delete cascade,
  kind text not null check (kind in ('income_letter','id','medicare_card','bank_statement','housing_cost','medical_expense','determination_letter','other')),
  storage_path text not null unique,
  filename text not null,
  mime text not null check (mime in ('application/pdf','image/jpeg','image/png')),
  size_bytes int not null check (size_bytes between 1 and 10485760),
  extraction_status text not null default 'none' check (extraction_status in ('none','done','failed')),
  extraction_usage jsonb,
  -- [{field, value, confidence, confirmed, final_value, confirmed_at}]. Only confirmed fields may be used downstream.
  extracted jsonb not null default '[]',
  created_at timestamptz not null default now()
);
create index on documents (household_id);
alter table documents enable row level security;
create policy doc_select on documents for select using (owns_household(household_id) or is_staff());
create policy doc_insert on documents for insert with check (owns_household(household_id));
create policy doc_update on documents for update using (owns_household(household_id)) with check (owns_household(household_id));
create policy doc_delete on documents for delete using (owns_household(household_id));
revoke update on documents from authenticated;
grant update (kind, extraction_status, extraction_usage, extracted) on documents to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 10485760, array['application/pdf','image/jpeg','image/png']);

-- Object path must be "<household_id>/<file>"; household ownership decides access.
create function storage_household(name text) returns uuid language sql immutable set search_path = public as $$
  select case when (string_to_array(name, '/'))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then (string_to_array(name, '/'))[1]::uuid end
$$;
create policy docs_obj_select on storage.objects for select to authenticated
  using (bucket_id = 'documents' and (owns_household(storage_household(name)) or is_staff()));
create policy docs_obj_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and owns_household(storage_household(name)));
create policy docs_obj_delete on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and owns_household(storage_household(name)));
