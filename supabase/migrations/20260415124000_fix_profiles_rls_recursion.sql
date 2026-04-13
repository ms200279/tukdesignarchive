-- Fix RLS infinite recursion on profiles/works/work_files/storage policies

create or replace function public.current_is_professor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'professor'
  );
$$;

revoke all on function public.current_is_professor() from public;
grant execute on function public.current_is_professor() to authenticated;

drop policy if exists "profiles_select_own_or_professor" on public.profiles;
create policy "profiles_select_own_or_professor"
on public.profiles for select
using (
  id = auth.uid()
  or public.current_is_professor()
);

drop policy if exists "works_professor_select" on public.works;
create policy "works_professor_select"
on public.works for select
using (
  owner_id = auth.uid()
  or public.current_is_professor()
);

drop policy if exists "work_files_professor_select" on public.work_files;
create policy "work_files_professor_select"
on public.work_files for select
using (
  exists (
    select 1 from public.works w
    where w.id = work_files.work_id
      and (w.owner_id = auth.uid() or public.current_is_professor())
  )
);

drop policy if exists "storage_work_originals_professor_select" on storage.objects;
create policy "storage_work_originals_professor_select"
on storage.objects for select to authenticated
using (
  bucket_id = 'work-originals'
  and (
    split_part(name, '/', 1) = auth.uid()::text
    or public.current_is_professor()
  )
);
