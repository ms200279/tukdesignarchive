import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getPublicSupabaseAnonKey, getPublicSupabaseUrl } from "@/config";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

type AppRole = "student" | "professor";

function readRoleFromClaims(
  claims: Record<string, unknown> | null | undefined,
): AppRole | null {
  if (!claims) return null;
  const app = (claims.app_metadata as Record<string, unknown> | undefined) ?? {};
  const user = (claims.user_metadata as Record<string, unknown> | undefined) ?? {};
  const raw = app.role ?? user.role ?? null;
  if (raw === "student" || raw === "professor") return raw;
  return null;
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

/**
 * Minimal auth proxy for protected routes only.
 *
 * - Uses `supabase.auth.getClaims()`, which verifies the access token locally
 *   against a cached JWKS. The common path does NOT contact Supabase Auth;
 *   a refresh only happens if the access token is close to expiry.
 * - Performs UX-level role redirect. Data authorization stays in Postgres RLS.
 */
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

  const { data, error } = await supabase.auth.getClaims();
  const role = error ? null : readRoleFromClaims(data?.claims);
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/student")) {
    if (!role) return redirectTo(request, "/login/student");
    if (role !== "student") return redirectTo(request, "/professor");
  } else if (pathname.startsWith("/professor")) {
    if (!role) return redirectTo(request, "/login/professor");
    if (role !== "professor") return redirectTo(request, "/student");
  }

  return supabaseResponse;
}
