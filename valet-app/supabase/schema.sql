-- Run this in your Supabase SQL editor
-- If you previously ran the old schema (with a `phone` column), drop the table first:
--   drop table if exists valet_tickets;

create table if not exists valet_tickets (
  id            uuid        default gen_random_uuid() primary key,
  ticket_number serial,
  name          text        not null,
  email         text        not null,
  car_make      text        not null,
  car_model     text        not null,
  car_color     text        not null,
  status        text        default 'Parked'
                            check (status in ('Parked', 'Requested', 'Ready', 'Picked Up')),
  request_token uuid        default gen_random_uuid(),
  created_at    timestamptz default now()
);

alter table valet_tickets enable row level security;

create policy "service_role_all" on valet_tickets
  for all
  using (true)
  with check (true);
