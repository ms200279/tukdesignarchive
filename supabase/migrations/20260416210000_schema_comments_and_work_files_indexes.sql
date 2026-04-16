-- Idempotent 보강: 핵심 테이블 설명 + 조회용 인덱스 (앱 동작 변경 없음)

comment on table public.profiles is
  'Auth 사용자(auth.users) 1:1 프로필. RLS: 본인 조회·수정, 교수는 전체 학생 프로필 조회 가능.';

comment on table public.works is
  '학생 소유 작품 메타데이터. RLS: 소유 학생 전체 CRUD, 교수는 전체 SELECT.';

comment on table public.work_files is
  '작품별 Storage 오브젝트 메타(storage_bucket + storage_path). 서명 URL은 앱에서만 발급.';

comment on column public.work_files.storage_path is
  '버킷 내 오브젝트 키(영구 URL 아님). 레거시 경로: userId/workId/...';

create index if not exists work_files_work_id_asset_class_idx
  on public.work_files (work_id, asset_class);

create index if not exists work_files_work_id_is_latest_idx
  on public.work_files (work_id)
  where is_latest = true;
