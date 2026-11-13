-- ROV ID Manager: Automation Center
-- Additive migration only. Does not alter or delete existing game account rows.

create extension if not exists pgcrypto;

create table if not exists public.automation_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  report_enabled boolean not null default true,
  report_time time not null default '18:00:00',
  report_timezone text not null default 'Asia/Bangkok',
  discord_enabled boolean not null default false,
  discord_webhook_url text,
  discord_summary_only boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.automation_workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  enabled boolean not null default true,
  trigger_type text not null default 'account.updated',
  action_type text not null default 'auto_tag',
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.automation_workflows(id) on delete cascade,
  field_name text not null check (field_name in ('game_id','game_name','notes')),
  operator text not null default 'contains' check (operator in ('contains','equals','starts_with')),
  value text not null,
  tag_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.account_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#d9f36a',
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

create table if not exists public.game_account_tags (
  account_id uuid not null references public.game_accounts(id) on delete cascade,
  tag_id uuid not null references public.account_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (account_id, tag_id)
);

create table if not exists public.automation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  account_id uuid references public.game_accounts(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.scheduled_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_date date not null,
  status text not null default 'generated' check (status in ('generated','sent','failed')),
  summary jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  unique(user_id, report_date)
);

alter table public.automation_settings enable row level security;
alter table public.automation_workflows enable row level security;
alter table public.automation_rules enable row level security;
alter table public.account_tags enable row level security;
alter table public.game_account_tags enable row level security;
alter table public.automation_events enable row level security;
alter table public.scheduled_reports enable row level security;

drop policy if exists "automation_settings_owner" on public.automation_settings;
create policy "automation_settings_owner" on public.automation_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "automation_workflows_owner" on public.automation_workflows;
create policy "automation_workflows_owner" on public.automation_workflows for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "automation_rules_owner" on public.automation_rules;
create policy "automation_rules_owner" on public.automation_rules for all using (exists (select 1 from public.automation_workflows w where w.id = workflow_id and w.user_id = auth.uid())) with check (exists (select 1 from public.automation_workflows w where w.id = workflow_id and w.user_id = auth.uid()));
drop policy if exists "account_tags_owner" on public.account_tags;
create policy "account_tags_owner" on public.account_tags for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "game_account_tags_owner" on public.game_account_tags;
create policy "game_account_tags_owner" on public.game_account_tags for all using (exists (select 1 from public.game_accounts a where a.id = account_id and a.user_id = auth.uid())) with check (exists (select 1 from public.game_accounts a where a.id = account_id and a.user_id = auth.uid()));
drop policy if exists "automation_events_owner" on public.automation_events;
create policy "automation_events_owner" on public.automation_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "scheduled_reports_owner" on public.scheduled_reports;
create policy "scheduled_reports_owner" on public.scheduled_reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists automation_events_user_created_idx on public.automation_events(user_id, created_at desc);
create index if not exists scheduled_reports_user_date_idx on public.scheduled_reports(user_id, report_date desc);
