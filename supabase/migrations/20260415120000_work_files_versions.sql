-- 작품 파일 버전 관리 + 대표 이미지 시리즈
alter table public.works add column if not exists cover_series_id uuid;

alter table public.work_files
  add column if not exists kind text not null default 'original';

alter table public.work_files
  drop constraint if exists work_files_kind_check;

alter table public.work_files
  add constraint work_files_kind_check check (kind in ('cover', 'original'));

alter table public.work_files
  add column if not exists series_id uuid not null default gen_random_uuid();

alter table public.work_files
  add column if not exists version int not null default 1;

alter table public.work_files
  add column if not exists is_latest boolean not null default true;

create unique index if not exists work_files_one_latest_per_series
  on public.work_files (series_id)
  where is_latest = true;

comment on column public.work_files.series_id is '동일 논리 자산(대표 이미지 또는 한 원본 줄기)의 버전 묶음';
comment on column public.work_files.is_latest is '해당 series_id에서 현재 대표 버전 여부(이전 버전은 false 유지)';
