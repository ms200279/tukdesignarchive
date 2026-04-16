/**
 * Typed slices of configuration (no process.env here).
 * Populated by `public.ts` / `server.ts` readers.
 */

/** Supabase-compatible public client credentials (safe to expose to the browser bundle). */
export type PublicSupabaseClientConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

/** All `NEXT_PUBLIC_*` driven app settings used across client + server. */
export type PublicAppConfig = PublicSupabaseClientConfig & {
  workFilesBucketId: string;
  studentEmailDomain: string;
  professorEmailDomain: string;
  coverPreviewSignedUrlTtlSeconds: number;
  workFileDownloadSignedUrlTtlSeconds: number;
};
