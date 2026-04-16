import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseAnonKey, getPublicSupabaseUrl } from "@/config/env";

/** Browser Supabase client (session + RLS). Implementation detail for SSR auth. */
export function createBrowserSupabaseClient() {
  const url = getPublicSupabaseUrl();
  const anon = getPublicSupabaseAnonKey();
  if (!url || !anon) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 가 설정되지 않았습니다.");
  }
  return createBrowserClient(url, anon);
}
