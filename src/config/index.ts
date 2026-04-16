/**
 * Public (non-secret) configuration — safe to import from client or server.
 * For secrets use `@/config/server` from Server Components / Route Handlers / `server-only` modules only.
 */
export type { PublicAppConfig, PublicSupabaseClientConfig } from "@/config/types";

export {
  coverPreviewSignedUrlTtlSeconds,
  getPublicAppConfig,
  getPublicSupabaseAnonKey,
  getPublicSupabaseUrl,
  professorEmailDomain,
  requirePublicSupabaseClientConfig,
  studentEmailDomain,
  tryGetPublicSupabaseClientConfig,
  workFileDownloadSignedUrlTtlSeconds,
  workFilesBucket,
} from "@/config/public";

export {
  DEFAULT_COVER_PREVIEW_SIGNED_URL_TTL_SEC,
  DEFAULT_PROFESSOR_EMAIL_DOMAIN,
  DEFAULT_STUDENT_EMAIL_DOMAIN,
  DEFAULT_WORK_FILE_DOWNLOAD_SIGNED_URL_TTL_SEC,
  DEFAULT_WORK_FILES_BUCKET_ID,
} from "@/config/defaults";
