import { getPublicSupabaseAnonKey, getPublicSupabaseUrl } from "@/config";
import { refreshAuthSessionFromRequest } from "@/lib/db/update-session";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  if (!getPublicSupabaseUrl() || !getPublicSupabaseAnonKey()) {
    return NextResponse.next({ request });
  }

  return refreshAuthSessionFromRequest(request);
}

export const config = {
  matcher: ["/student/:path*", "/professor/:path*", "/login/:path*", "/signup/:path*"],
};
