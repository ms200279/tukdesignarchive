import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicSupabaseAnonKey, getPublicSupabaseUrl } from "@/config/env";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

/** Server / Server Action Supabase client (cookies + RLS). */
export async function createServerSupabaseClient() {
  const url = getPublicSupabaseUrl();
  const anon = getPublicSupabaseAnonKey();
  if (!url || !anon) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 가 설정되지 않았습니다.");
  }

  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(
              name,
              value,
              options as Parameters<typeof cookieStore.set>[2],
            ),
          );
        } catch {
          /* Server Component에서 set 불가 시 무시 */
        }
      },
    },
  });
}
