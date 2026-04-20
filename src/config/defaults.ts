/**
 * Non-secret fallbacks that must stay aligned with SQL migrations / Storage RLS.
 * Change these only together with `supabase/migrations/*` and app path rules.
 */
export const DEFAULT_WORK_FILES_BUCKET_ID = "work-originals" as const;

/**
 * 학생 계정은 Supabase Auth가 email 형식을 요구해 학번을 `학번@<이 도메인>`으로
 * 합성해 저장합니다. 실제 메일은 발송되지 않는 의도된 더미(.local)이며,
 * 운영에서도 그대로 두거나 다른 미등록 도메인으로 바꿔도 무방합니다.
 * 단, 기존 가입자가 있는 상태에서 바꾸면 모두 로그인 불가가 됩니다.
 */
export const DEFAULT_STUDENT_EMAIL_DOMAIN = "student.tuk-archive.local" as const;

/**
 * 교수 회원가입 시 허용할 실제 학교 이메일 도메인 목록.
 * 다중 도메인은 쉼표(,) 구분으로 `NEXT_PUBLIC_PROFESSOR_EMAIL_DOMAIN` 환경 변수에
 * 지정합니다. 예: `tukorea.ac.kr,kpu.ac.kr`
 */
export const DEFAULT_PROFESSOR_EMAIL_DOMAINS = [
  "tukorea.ac.kr",
  "kpu.ac.kr",
] as const;

export const DEFAULT_COVER_PREVIEW_SIGNED_URL_TTL_SEC = 900;
export const DEFAULT_WORK_FILE_DOWNLOAD_SIGNED_URL_TTL_SEC = 60 * 30;
