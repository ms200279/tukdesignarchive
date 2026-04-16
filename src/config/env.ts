/**
 * Centralized public/runtime configuration.
 * Keeps env reads out of app routes and UI for easier provider swaps.
 */

export function getPublicSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getPublicSupabaseAnonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

/** Object storage bucket for work originals (must match DB / RLS migrations). */
export function workFilesBucket(): string {
  return process.env.NEXT_PUBLIC_WORK_FILES_BUCKET ?? "work-originals";
}

export function studentEmailDomain(): string {
  return (
    process.env.NEXT_PUBLIC_STUDENT_EMAIL_DOMAIN ?? "student.tuk-archive.local"
  );
}

export function professorEmailDomain(): string {
  return process.env.NEXT_PUBLIC_PROFESSOR_EMAIL_DOMAIN ?? "tukorea.ac.kr";
}

export function coverPreviewSignedUrlTtlSeconds(): number {
  return 900;
}

export function workFileDownloadSignedUrlTtlSeconds(): number {
  return 60 * 30;
}
