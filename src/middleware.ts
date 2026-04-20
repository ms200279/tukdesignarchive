import { getPublicSupabaseAnonKey, getPublicSupabaseUrl } from "@/config";
import { refreshAuthSessionFromRequest } from "@/lib/db/update-session";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  if (!getPublicSupabaseUrl() || !getPublicSupabaseAnonKey()) {
    return NextResponse.next({ request });
  }

  return refreshAuthSessionFromRequest(request);
}

// Routes that need auth/role-aware handling:
//   - `/`                  → bounce authed users to their dashboard; anonymous
//                            users fall through to the statically prerendered
//                            landing page.
//   - `/student/:path*`    → require student session.
//   - `/professor/:path*`  → require professor session.
// All other public routes (`/login/*`, `/signup/*`, static assets) remain
// untouched and may be statically optimized.
export const config = {
  matcher: ["/", "/student/:path*", "/professor/:path*"],
};
