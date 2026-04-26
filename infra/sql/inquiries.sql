create table inquiries (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  listing_id   uuid not null references submissions(id) on delete cascade,
  buyer_name   text not null,
  buyer_phone  text not null,
  buyer_email  text not null,
  message      text,
  contacted    boolean default false
);
create index on inquiries (listing_id, created_at desc);
create index on inquiries (contacted, created_at desc);