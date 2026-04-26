create table submissions (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz default now(),
  source          text not null default 'seller'
                  check (source in ('seller', 'admin')),
  first_name      text,
  last_name       text,
  phone           text,
  email           text,
  year            integer not null,
  make            text not null,
  model           text not null,
  color           text,
  vehicle_type    text not null,
  mileage         integer,
  monthly_payment numeric(10,2) not null,
  payments_left   integer not null,
  lender          text not null,
  balance         numeric(10,2),
  comfort_level   text not null check (comfort_level in ('yes','maybe','no')),
  seller_reason   text,
  status          text not null default 'pending'
                  check (status in ('pending','live','sold','rejected','contacted')),
  photo_urls      text[] not null,
  admin_notes     text
);
create index on submissions (status, created_at desc);
create index on submissions (email);
create index on submissions (phone);