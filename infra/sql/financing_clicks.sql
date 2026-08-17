create table financing_clicks (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  listing_id uuid references submissions(id) on delete set null,
  referrer   text
);
create index on financing_clicks (created_at desc);
create index on financing_clicks (listing_id, created_at desc);

alter table financing_clicks enable row level security;
