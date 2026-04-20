import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getPublicSupabaseAnonKey,
  getPublicSupabaseUrl,
} from "@/config";

let cachedClient: SupabaseClient | null = null;

/**
 * Client Component 전용 Supabase 클라이언트.
 *
 * Server Action 경로(Vercel 함수 body 4.5MB 캡)를 우회해 브라우저에서 Storage에
 * 직접 업로드할 때 사용합니다. `createBrowserClient`는 `document.cookie`를 읽어
 * 동일 탭의 SSR 세션과 인증을 공유하므로, 업로드 시에도 학생의 `auth.uid()` 기반
 * RLS 정책이 그대로 적용됩니다.
 *
 * 탭 내에서 중복 인스턴스가 생기지 않도록 싱글턴으로 캐시합니다.
 */
export function getBrowserSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = getPublicSupabaseUrl();
  const anon = getPublicSupabaseAnonKey();
  if (!url || !anon) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 가 설정되어 있지 않습니다.",
    );
  }

  cachedClient = createBrowserClient(url, anon);
  return cachedClient;
}
