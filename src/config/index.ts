/**
 * Public (non-secret) configuration — safe to import from client or server.
 */
export {
  coverPreviewSignedUrlTtlSeconds,
  getPublicSupabaseAnonKey,
  getPublicSupabaseUrl,
  professorEmailDomain,
  requirePublicSupabaseClientConfig,
  studentEmailDomain,
  workFileDownloadSignedUrlTtlSeconds,
  workFilesBucket,
} from "@/config/public";
