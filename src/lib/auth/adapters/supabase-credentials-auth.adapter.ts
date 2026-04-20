import { createServerSupabaseClient } from "@/lib/db/server";
import type {
  AuthIdentityClaims,
  CredentialsAuthPort,
  SignInResult,
  SignUpResult,
} from "@/lib/auth/ports/credentials-auth.port";

function readAppRoleFromClaims(
  appMetadata: Record<string, unknown> | undefined,
  userMetadata: Record<string, unknown> | undefined,
): "student" | "professor" | null {
  // Prefer admin-managed app_metadata if present (tamper-resistant),
  // fall back to user_metadata written at signup.
  const raw =
    (appMetadata?.role as unknown) ?? (userMetadata?.role as unknown) ?? null;
  if (raw === "student" || raw === "professor") return raw;
  return null;
}

function readStringFromMeta(
  meta: Record<string, unknown> | undefined,
  key: string,
): string | null {
  const v = meta?.[key];
  return typeof v === "string" && v.length > 0 ? v : null;
}

export class SupabaseCredentialsAuthAdapter implements CredentialsAuthPort {
  async signInWithPassword(params: {
    email: string;
    password: string;
  }): Promise<SignInResult> {
    const db = await createServerSupabaseClient();
    const { error } = await db.auth.signInWithPassword({
      email: params.email,
      password: params.password,
    });
    if (error) {
      return { ok: false, error: { message: error.message, code: error.code } };
    }
    return { ok: true };
  }

  async signUpWithMetadata(params: {
    email: string;
    password: string;
    metadata: Record<string, unknown>;
  }): Promise<SignUpResult> {
    const db = await createServerSupabaseClient();
    const { data, error } = await db.auth.signUp({
      email: params.email,
      password: params.password,
      options: { data: params.metadata },
    });
    if (error) {
      return {
        ok: false,
        error: {
          message: error.message,
          code: error.code,
          status: error.status,
        },
      };
    }
    const identities = data.user?.identities;
    const identitiesCount = Array.isArray(identities) ? identities.length : 0;
    return { ok: true, identitiesCount };
  }

  async signOut(): Promise<void> {
    const db = await createServerSupabaseClient();
    await db.auth.signOut();
  }

  async getCurrentAuthClaims(): Promise<AuthIdentityClaims | null> {
    const db = await createServerSupabaseClient();
    // getClaims() verifies the JWT locally against a cached JWKS; it only
    // contacts Supabase when the access token has expired and needs refresh.
    const { data, error } = await db.auth.getClaims();
    if (error || !data?.claims) return null;

    const c = data.claims;
    const role = readAppRoleFromClaims(
      c.app_metadata as Record<string, unknown> | undefined,
      c.user_metadata as Record<string, unknown> | undefined,
    );
    if (!role) return null;

    return {
      userId: c.sub,
      role,
      student_id: readStringFromMeta(
        c.user_metadata as Record<string, unknown> | undefined,
        "student_id",
      ),
      display_name: readStringFromMeta(
        c.user_metadata as Record<string, unknown> | undefined,
        "display_name",
      ),
    };
  }
}
