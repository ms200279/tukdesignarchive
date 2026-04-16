/**
 * Non-secret fallbacks that must stay aligned with SQL migrations / Storage RLS.
 * Change these only together with `supabase/migrations/*` and app path rules.
 */
export const DEFAULT_WORK_FILES_BUCKET_ID = "work-originals" as const;

/** Dev placeholder; production must set NEXT_PUBLIC_STUDENT_EMAIL_DOMAIN. */
export const DEFAULT_STUDENT_EMAIL_DOMAIN = "student.tuk-archive.local" as const;

/** Example school domain; production must set NEXT_PUBLIC_PROFESSOR_EMAIL_DOMAIN. */
export const DEFAULT_PROFESSOR_EMAIL_DOMAIN = "tukorea.ac.kr" as const;

export const DEFAULT_COVER_PREVIEW_SIGNED_URL_TTL_SEC = 900;
export const DEFAULT_WORK_FILE_DOWNLOAD_SIGNED_URL_TTL_SEC = 60 * 30;
