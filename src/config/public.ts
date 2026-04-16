import {
  DEFAULT_COVER_PREVIEW_SIGNED_URL_TTL_SEC,
  DEFAULT_PROFESSOR_EMAIL_DOMAIN,
  DEFAULT_STUDENT_EMAIL_DOMAIN,
  DEFAULT_WORK_FILE_DOWNLOAD_SIGNED_URL_TTL_SEC,
  DEFAULT_WORK_FILES_BUCKET_ID,
} from "@/config/defaults";
import type {
  PublicAppConfig,
  PublicSupabaseClientConfig,
} from "@/config/types";

function trimEnv(name: string): string | undefined {
  const v = process.env[name];
  if (v == null) return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}

function readPositiveIntEnv(name: string, fallback: number): number {
  const raw = trimEnv(name);
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Returns null if URL or anon key missing (e.g. middleware no-op). */
export function tryGetPublicSupabaseClientConfig(): PublicSupabaseClientConfig | null {
  const supabaseUrl = trimEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = trimEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return { supabaseUrl, supabaseAnonKey };
}

/**
 * Throws when Supabase public vars are missing.
 * Use from server modules that always require a DB/auth client.
 */
export function requirePublicSupabaseClientConfig(): PublicSupabaseClientConfig {
  const c = tryGetPublicSupabaseClientConfig();
  if (!c) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL 및 NEXT_PUBLIC_SUPABASE_ANON_KEY 가 필요합니다.",
    );
  }
  return c;
}

/** Legacy helpers — prefer `tryGetPublicSupabaseClientConfig` for new code. */
export function getPublicSupabaseUrl(): string | undefined {
  return tryGetPublicSupabaseClientConfig()?.supabaseUrl;
}

export function getPublicSupabaseAnonKey(): string | undefined {
  return tryGetPublicSupabaseClientConfig()?.supabaseAnonKey;
}

/** Storage bucket id (must match RLS + `work_files.storage_bucket` defaults). */
export function workFilesBucket(): string {
  return trimEnv("NEXT_PUBLIC_WORK_FILES_BUCKET") ?? DEFAULT_WORK_FILES_BUCKET_ID;
}

export function studentEmailDomain(): string {
  return trimEnv("NEXT_PUBLIC_STUDENT_EMAIL_DOMAIN") ?? DEFAULT_STUDENT_EMAIL_DOMAIN;
}

export function professorEmailDomain(): string {
  return (
    trimEnv("NEXT_PUBLIC_PROFESSOR_EMAIL_DOMAIN") ?? DEFAULT_PROFESSOR_EMAIL_DOMAIN
  );
}

export function coverPreviewSignedUrlTtlSeconds(): number {
  return readPositiveIntEnv(
    "NEXT_PUBLIC_COVER_PREVIEW_SIGNED_URL_TTL_SEC",
    DEFAULT_COVER_PREVIEW_SIGNED_URL_TTL_SEC,
  );
}

export function workFileDownloadSignedUrlTtlSeconds(): number {
  return readPositiveIntEnv(
    "NEXT_PUBLIC_WORK_FILE_DOWNLOAD_SIGNED_URL_TTL_SEC",
    DEFAULT_WORK_FILE_DOWNLOAD_SIGNED_URL_TTL_SEC,
  );
}

/** Single object for server layout / debugging (still public-only fields). */
export function getPublicAppConfig(): PublicAppConfig {
  const sb = tryGetPublicSupabaseClientConfig();
  return {
    supabaseUrl: sb?.supabaseUrl ?? "",
    supabaseAnonKey: sb?.supabaseAnonKey ?? "",
    workFilesBucketId: workFilesBucket(),
    studentEmailDomain: studentEmailDomain(),
    professorEmailDomain: professorEmailDomain(),
    coverPreviewSignedUrlTtlSeconds: coverPreviewSignedUrlTtlSeconds(),
    workFileDownloadSignedUrlTtlSeconds: workFileDownloadSignedUrlTtlSeconds(),
  };
}
