-- Student registry: 학번별 내부 고유 ID 부여
create table if not exists public.student_registry (
  id bigint generated always as identity primary key,
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  student_id text not null unique,
  created_at timestamptz not null default now(),
  constraint student_registry_student_id_format check (student_id ~ '^[0-9]{10}$')
);

create index if not exists student_registry_student_id_idx
  on public.student_registry (student_id);

-- 기존 학생 데이터 백필
insert into public.student_registry (profile_id, student_id)
select p.id, p.student_id
from public.profiles p
where p.role = 'student'
  and p.student_id is not null
on conflict (profile_id) do update
set student_id = excluded.student_id;

create or replace function public.sync_student_registry_from_profiles()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'student' and new.student_id is not null then
    insert into public.student_registry (profile_id, student_id)
    values (new.id, new.student_id)
    on conflict (profile_id) do update
    set student_id = excluded.student_id;
  else
    delete from public.student_registry where profile_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_student_registry on public.profiles;
create trigger trg_sync_student_registry
after insert or update of role, student_id on public.profiles
for each row
execute function public.sync_student_registry_from_profiles();

alter table public.student_registry enable row level security;

drop policy if exists "student_registry_select_own_or_professor" on public.student_registry;
create policy "student_registry_select_own_or_professor"
on public.student_registry
for select
to authenticated
using (
  profile_id = auth.uid()
  or public.current_is_professor()
);
