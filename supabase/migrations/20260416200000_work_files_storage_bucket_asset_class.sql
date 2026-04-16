-- work_files: explicit bucket + storage tier for migration-friendly refs (S3/R2 등).
-- physical object keys(storage_path) 유지 — 기존 Storage 객체·RLS 경로와 호환.

alter table public.work_files
  add column if not exists storage_bucket text not null default 'work-originals';

alter table public.work_files
  add column if not exists asset_class text not null default 'original';

alter table public.work_files
  drop constraint if exists work_files_asset_class_check;

alter table public.work_files
  add constraint work_files_asset_class_check
  check (asset_class in ('original', 'preview', 'thumbnail'));

-- kind(cover|original) → 저장 계층: 대표 이미지는 preview, 제출 원본은 original
update public.work_files
set asset_class = case when kind = 'cover' then 'preview' else 'original' end
where true;

comment on column public.work_files.storage_bucket is '오브젝트 스토리지 버킷 id (Supabase Storage / S3 호환 이주 시 동일 개념)';
comment on column public.work_files.asset_class is '원본·파생 미리보기·썸네일 구분; kind(제품 의미)와 별개';
