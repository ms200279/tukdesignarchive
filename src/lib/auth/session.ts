import { credentialsAuth } from "@/lib/auth/auth-instances";
import type { AuthIdentity, UserRole } from "@/types/domain";
import { cache } from "react";

/**
 * Per-request cached, claim-based identity.
 *
 * Uses Supabase `auth.getClaims()` which verifies the JWT locally against a
 * cached JWKS — no GoTrue network hop on the common path. A refresh only
 * occurs when the access token is close to expiry.
 *
 * This is the ONLY supported server-side auth primitive. Previous
 * `getUser()`-based helpers have been removed because:
 *   - Data authorization is enforced by Postgres RLS (single source of truth).
 *   - No feature in this app requires a GoTrue-authoritative user fetch.
 */
const getAuthIdentityCached = cache(async (): Promise<AuthIdentity | null> => {
  return credentialsAuth.getCurrentAuthClaims();
});

export async function getAuthIdentity(): Promise<AuthIdentity | null> {
  return getAuthIdentityCached();
}

export function identityHasRole<R extends UserRole>(
  identity: AuthIdentity | null,
  role: R,
): identity is AuthIdentity & { role: R } {
  return !!identity && identity.role === role;
}

export function isStudentIdentity(
  identity: AuthIdentity | null,
): identity is AuthIdentity & { role: "student" } {
  return identityHasRole(identity, "student");
}

export function isProfessorIdentity(
  identity: AuthIdentity | null,
): identity is AuthIdentity & { role: "professor" } {
  return identityHasRole(identity, "professor");
}
