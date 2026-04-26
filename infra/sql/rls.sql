alter table submissions enable row level security;
create policy "public reads live and sold"
  on submissions for select
  using (status in ('live', 'sold'));
create policy "public can insert seller submissions"
  on submissions for insert
  with check (source = 'seller');

alter table inquiries enable row level security;
create policy "public can insert inquiries"
  on inquiries for insert
  with check (true);
create policy "allow public uploads"
  on storage.objects for insert
  with check (bucket_id = 'vehicle-photos');