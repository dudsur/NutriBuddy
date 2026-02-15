-- Run this in Supabase SQL Editor to create the food_logs table.
-- Dashboard: your project -> SQL Editor -> New query -> paste -> Run

create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  food_name text not null,
  calories numeric default 0,
  protein numeric default 0,
  carbs numeric default 0,
  fat numeric default 0,
  vitamin_c numeric default 0,
  iron numeric default 0,
  date timestamptz default now()
);

alter table public.food_logs enable row level security;

create policy "Service role full access"
  on public.food_logs for all using (true) with check (true);
