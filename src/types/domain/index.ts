export type UserRole = "student" | "professor";

export type Profile = {
  id: string;
  role: UserRole;
  student_id: string | null;
  display_name: string | null;
  created_at: string;
};

export type Work = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  exhibition_year: number | null;
  metadata: Record<string, unknown>;
  cover_series_id?: string | null;
  created_at: string;
  updated_at: string;
};

import type { StorageAssetClass, StoredObjectRef } from "./stored-object";

export type { StorageAssetClass, StoredObjectRef };

export type WorkFileKind = "cover" | "original";

/**
 * Normalized work file metadata (DB: work_files).
 * `path` + `bucket` identify the object; signed URLs are derived at read time only.
 */
export type WorkFile = {
  id: string;
  work_id: string;
  bucket: string;
  path: string;
  original_filename: string;
  mime_type: string | null;
  file_size: number | null;
  version: number;
  uploaded_at: string;
  asset_class: StorageAssetClass;
  /** Product pipeline: representative image series vs submitted originals. */
  kind: WorkFileKind;
  series_id: string;
  is_latest: boolean;
};

/**
 * Lightweight identity derived from a locally-verified JWT. Safe to use for
 * UX redirects and owner-scoped queries; actual data authorization stays in
 * Postgres RLS.
 */
export type AuthIdentity = {
  userId: string;
  role: UserRole;
  student_id: string | null;
  display_name: string | null;
};

/** 학생 대시보드 작품 한 줄. */
export type StudentWorkListItem = Pick<
  Work,
  "id" | "title" | "description" | "exhibition_year" | "updated_at"
>;

/** 교수 목록: 작품 + 소유 학생 요약. */
export type ProfessorWorkListItem = Pick<
  Work,
  "id" | "title" | "exhibition_year" | "updated_at"
> & {
  owner: { display_name: string | null; student_id: string | null } | null;
};

/** 교수 상세: 작품 전체 + 소유 학생. */
export type ProfessorWorkDetail = Work & {
  owner: { display_name: string | null; student_id: string | null } | null;
};
