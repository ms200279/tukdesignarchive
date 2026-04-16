import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getPublicSupabaseAnonKey, getPublicSupabaseUrl } from "@/config/env";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

/** Refreshes auth cookies for SSR (Supabase-specific transport). */
export async function refreshAuthSessionFromRequest(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = getPublicSupabaseUrl();
  const anon = getPublicSupabaseAnonKey();
  if (!url || !anon) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(
            name,
            value,
            options as Parameters<typeof supabaseResponse.cookies.set>[2],
          ),
        );
      },
    },
  });

  await supabase.auth.getUser();

  return supabaseResponse;
}
