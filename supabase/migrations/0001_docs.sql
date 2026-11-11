-- One table holds campaigns and trend records as JSON.
-- RLS is on with no policies, so only the server (secret key) can read or write.
create table if not exists public.docs (
  kind text not null,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (kind, id)
);

alter table public.docs enable row level security;
