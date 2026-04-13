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

export type WorkFileKind = "cover" | "original";

export type WorkFile = {
  id: string;
  work_id: string;
  storage_path: string;
  original_name: string;
  content_type: string | null;
  byte_size: number | null;
  kind: WorkFileKind;
  series_id: string;
  version: number;
  is_latest: boolean;
  created_at: string;
};

export type WorkWithOwner = Work & {
  owner: Pick<Profile, "display_name" | "student_id"> | null;
};

export type StudentRegistry = {
  id: number;
  profile_id: string;
  student_id: string;
  created_at: string;
};
