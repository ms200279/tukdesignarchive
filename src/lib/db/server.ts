import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requirePublicSupabaseClientConfig } from "@/config";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

/** Server / Server Action Supabase client (cookies + RLS). */
export async function createServerSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = requirePublicSupabaseClientConfig();

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
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
