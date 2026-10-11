-- Public notebook: anyone with access to this project can read and modify notes.
create table public.notebook_notes (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  content text not null check (char_length(btrim(content)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notebook_notes enable row level security;
grant select, insert, update, delete on public.notebook_notes to anon, authenticated;
create policy "Public notebook access" on public.notebook_notes
  for all to anon, authenticated using (true) with check (true);
