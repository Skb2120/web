create extension if not exists "pgcrypto";

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level int not null check (level between 0 and 100),
  icon text not null default 'Cpu',
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  "techStack" jsonb not null default '[]'::jsonb,
  "imageURL" text,
  "projectURL" text,
  "githubURL" text,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  "techStack" jsonb not null default '[]'::jsonb,
  domain text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  domain text not null,
  idea text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.chat_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  service text not null,
  idea text not null,
  messages jsonb not null default '[]'::jsonb,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.lead_conversions (
  id uuid primary key default gen_random_uuid(),
  lead_name text not null,
  project_title text not null,
  value numeric default 0,
  status text not null default 'converted',
  created_at timestamptz not null default now()
);

create table if not exists public.duty_exams (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  exam_name text not null,
  college_name text not null,
  role text not null check (role in ('Invigilator', 'IT Manager', 'MAF', 'MOE', 'Lians Officers', 'Network Admin')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'received')),
  created_at timestamptz not null default now()
);

alter table public.messages add column if not exists phone text default '';
alter table public.duty_exams add column if not exists college_name text not null default '';
alter table public.duty_exams drop constraint if exists duty_exams_role_check;
update public.duty_exams set role = 'Invigilator' where role = 'invigilator';
alter table public.duty_exams add constraint duty_exams_role_check check (role in ('Invigilator', 'IT Manager', 'MAF', 'MOE', 'Lians Officers', 'Network Admin'));

insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do nothing;

alter table public.skills enable row level security;
alter table public.projects enable row level security;
alter table public.services enable row level security;
alter table public.messages enable row level security;
alter table public.chat_leads enable row level security;
alter table public.lead_conversions enable row level security;
alter table public.duty_exams enable row level security;

create policy "public can read skills" on public.skills for select using (true);
create policy "public can read projects" on public.projects for select using (true);
create policy "public can read services" on public.services for select using (true);
create policy "public can create messages" on public.messages for insert with check (true);
create policy "public can create chat leads" on public.chat_leads for insert with check (true);

create policy "admins manage skills" on public.skills for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admins manage projects" on public.projects for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admins manage services" on public.services for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admins read messages" on public.messages for select using (auth.role() = 'authenticated');
create policy "admins update messages" on public.messages for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admins read chat leads" on public.chat_leads for select using (auth.role() = 'authenticated');
create policy "admins update chat leads" on public.chat_leads for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admins manage conversions" on public.lead_conversions for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admins manage duty exams" on public.duty_exams for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public can read portfolio media" on storage.objects for select using (bucket_id = 'portfolio-media');
create policy "admins upload portfolio media" on storage.objects for insert with check (bucket_id = 'portfolio-media' and auth.role() = 'authenticated');
create policy "admins update portfolio media" on storage.objects for update using (bucket_id = 'portfolio-media' and auth.role() = 'authenticated');
create policy "admins delete portfolio media" on storage.objects for delete using (bucket_id = 'portfolio-media' and auth.role() = 'authenticated');
