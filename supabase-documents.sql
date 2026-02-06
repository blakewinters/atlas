create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text, -- extracted text content
  file_type text not null,
  file_size integer,
  tags text[],
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "Users can view their own documents" on public.documents for select using (auth.uid() = user_id);
create policy "Users can insert their own documents" on public.documents for insert with check (auth.uid() = user_id);
create policy "Users can update their own documents" on public.documents for update using (auth.uid() = user_id);
create policy "Users can delete their own documents" on public.documents for delete using (auth.uid() = user_id);

create index idx_documents_user_id on public.documents(user_id);
create index idx_documents_created_at on public.documents(created_at);
