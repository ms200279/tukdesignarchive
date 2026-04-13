-- 졸업전시 아카이브: 프로필, 작품 메타데이터, 파일 메타 + Storage RLS
-- 학생 계정은 Auth 이메일을 `학번@<NEXT_PUBLIC_STUDENT_EMAIL_DOMAIN>` 형태로 생성하고,
-- user_metadata에 role, student_id, display_name을 넣으면 프로필이 자동 생성됩니다.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('student', 'professor')),
  student_id text unique,
  display_name text,
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_student_id_unique
  on public.profiles (student_id)
  where student_id is not null;

create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default '제목 없음',
  description text,
  exhibition_year int,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work_files (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works (id) on delete cascade,
  storage_path text not null,
  original_name text not null,
  content_type text,
  byte_size bigint,
  created_at timestamptz not null default now()
);

create index if not exists works_owner_id_idx on public.works (owner_id);
create index if not exists work_files_work_id_idx on public.work_files (work_id);

create or replace function public.set_works_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists works_set_updated_at on public.works;
create trigger works_set_updated_at
before update on public.works
for each row execute function public.set_works_updated_at();

-- Auth 가입 시 프로필 자동 생성 (관리자가 Dashboard에서 유저 생성 시 metadata 설정)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r text;
begin
  r := coalesce(nullif(trim(new.raw_user_meta_data->>'role'), ''), 'student');
  if r not in ('student', 'professor') then
    r := 'student';
  end if;

  insert into public.profiles (id, role, student_id, display_name)
  values (
    new.id,
    r,
    nullif(trim(new.raw_user_meta_data->>'student_id'), ''),
    nullif(trim(new.raw_user_meta_data->>'display_name'), '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.works enable row level security;
alter table public.work_files enable row level security;

create policy "profiles_select_own_or_professor"
on public.profiles for select
using (
  id = (select auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'professor'
  )
);

create policy "profiles_update_self"
on public.profiles for update
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "works_student_all"
on public.works for all
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "works_professor_select"
on public.works for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'professor'
  )
);

create policy "work_files_student_all"
on public.work_files for all
using (
  exists (
    select 1 from public.works w
    where w.id = work_files.work_id and w.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.works w
    where w.id = work_files.work_id and w.owner_id = (select auth.uid())
  )
);

create policy "work_files_professor_select"
on public.work_files for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'professor'
  )
);

-- Storage: 원본 파일 버킷 (비공개)
insert into storage.buckets (id, name, public)
values ('work-originals', 'work-originals', false)
on conflict (id) do nothing;

create policy "storage_work_originals_student_insert"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'work-originals'
  and split_part(name, '/', 1) = (select auth.uid())::text
);

create policy "storage_work_originals_student_manage"
on storage.objects for update to authenticated
using (
  bucket_id = 'work-originals'
  and split_part(name, '/', 1) = (select auth.uid())::text
)
with check (
  bucket_id = 'work-originals'
  and split_part(name, '/', 1) = (select auth.uid())::text
);

create policy "storage_work_originals_student_delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'work-originals'
  and split_part(name, '/', 1) = (select auth.uid())::text
);

create policy "storage_work_originals_student_select"
on storage.objects for select to authenticated
using (
  bucket_id = 'work-originals'
  and split_part(name, '/', 1) = (select auth.uid())::text
);

create policy "storage_work_originals_professor_select"
on storage.objects for select to authenticated
using (
  bucket_id = 'work-originals'
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'professor'
  )
);
