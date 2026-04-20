/**
 * Public (non-secret) configuration — safe to import from client or server.
 */
export {
  coverPreviewSignedUrlTtlSeconds,
  getPublicSupabaseAnonKey,
  getPublicSupabaseUrl,
  professorEmailDomain,
  professorEmailDomains,
  requirePublicSupabaseClientConfig,
  studentEmailDomain,
  workFileDownloadSignedUrlTtlSeconds,
  workFilesBucket,
} from "@/config/public";
