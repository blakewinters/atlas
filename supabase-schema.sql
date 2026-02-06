-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create meetings table
create table public.meetings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  date timestamptz not null,
  raw_transcript text not null,
  summary text,
  action_items jsonb,
  decisions jsonb,
  key_topics text[],
  created_at timestamptz not null default now()
);

-- Create tasks table
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meeting_id uuid references public.meetings(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date text,
  created_at timestamptz not null default now()
);

-- Create notes table
create table public.notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  tags text[],
  created_at timestamptz not null default now()
);

-- Create chat_history table
create table public.chat_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS on all tables
alter table public.meetings enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.chat_history enable row level security;

-- RLS policies for meetings table
create policy "Users can view their own meetings"
  on public.meetings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own meetings"
  on public.meetings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own meetings"
  on public.meetings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own meetings"
  on public.meetings for delete
  using (auth.uid() = user_id);

-- RLS policies for tasks table
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- RLS policies for notes table
create policy "Users can view their own notes"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own notes"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own notes"
  on public.notes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own notes"
  on public.notes for delete
  using (auth.uid() = user_id);

-- RLS policies for chat_history table
create policy "Users can view their own chat history"
  on public.chat_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own chat history"
  on public.chat_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own chat history"
  on public.chat_history for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own chat history"
  on public.chat_history for delete
  using (auth.uid() = user_id);

-- Create indexes for meetings table
create index idx_meetings_user_id on public.meetings(user_id);
create index idx_meetings_created_at on public.meetings(created_at);

-- Create indexes for tasks table
create index idx_tasks_user_id on public.tasks(user_id);
create index idx_tasks_created_at on public.tasks(created_at);
create index idx_tasks_meeting_id on public.tasks(meeting_id);

-- Create indexes for notes table
create index idx_notes_user_id on public.notes(user_id);
create index idx_notes_created_at on public.notes(created_at);

-- Create indexes for chat_history table
create index idx_chat_history_user_id on public.chat_history(user_id);
create index idx_chat_history_created_at on public.chat_history(created_at);
