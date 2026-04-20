import {
  DEFAULT_COVER_PREVIEW_SIGNED_URL_TTL_SEC,
  DEFAULT_PROFESSOR_EMAIL_DOMAINS,
  DEFAULT_STUDENT_EMAIL_DOMAIN,
  DEFAULT_WORK_FILE_DOWNLOAD_SIGNED_URL_TTL_SEC,
  DEFAULT_WORK_FILES_BUCKET_ID,
} from "@/config/defaults";
import type { PublicSupabaseClientConfig } from "@/config/types";

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
function tryGetPublicSupabaseClientConfig(): PublicSupabaseClientConfig | null {
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

/**
 * 교수 허용 도메인 목록. 환경 변수는 쉼표 구분 문자열로 받습니다.
 * 예: `NEXT_PUBLIC_PROFESSOR_EMAIL_DOMAIN="tukorea.ac.kr,kpu.ac.kr"`
 *
 * 각 항목은 소문자·공백 제거로 정규화되며, 비어있는 값이면 기본 도메인
 * 리스트(`DEFAULT_PROFESSOR_EMAIL_DOMAINS`)를 반환합니다.
 */
export function professorEmailDomains(): readonly string[] {
  const raw = trimEnv("NEXT_PUBLIC_PROFESSOR_EMAIL_DOMAIN");
  if (!raw) return DEFAULT_PROFESSOR_EMAIL_DOMAINS;
  const parsed = raw
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter((d) => d.length > 0);
  return parsed.length > 0 ? parsed : DEFAULT_PROFESSOR_EMAIL_DOMAINS;
}

/** UI 표시용: 허용 도메인 중 첫 번째(대표) 도메인. 검증에는 사용 금지. */
export function professorEmailDomain(): string {
  return professorEmailDomains()[0] ?? DEFAULT_PROFESSOR_EMAIL_DOMAINS[0];
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
