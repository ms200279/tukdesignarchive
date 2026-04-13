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
  created_at: string;
  updated_at: string;
};

export type WorkFile = {
  id: string;
  work_id: string;
  storage_path: string;
  original_name: string;
  content_type: string | null;
  byte_size: number | null;
  created_at: string;
};

export type WorkWithOwner = Work & {
  owner: Pick<Profile, "display_name" | "student_id"> | null;
};
