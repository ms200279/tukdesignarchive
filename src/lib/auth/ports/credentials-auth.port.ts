/**
 * Email/password auth at the application boundary.
 * Supabase Auth (or any IdP) lives only in the adapter implementation.
 */

type AuthErrorLike = {
  message?: string;
  code?: string;
  status?: number;
};

export type SignInResult = { ok: true } | { ok: false; error: AuthErrorLike };

export type SignUpResult =
  | { ok: true; identitiesCount: number }
  | { ok: false; error: AuthErrorLike };

/**
 * Lightweight, verified auth identity that can be extracted from a signed
 * access token WITHOUT a round-trip to the auth server.
 *
 * Only fields that are safe to derive from JWT claims belong here.
 */
export type AuthIdentityClaims = {
  userId: string;
  role: "student" | "professor";
  student_id: string | null;
  display_name: string | null;
};

export interface CredentialsAuthPort {
  signInWithPassword(params: {
    email: string;
    password: string;
  }): Promise<SignInResult>;

  signUpWithMetadata(params: {
    email: string;
    password: string;
    metadata: Record<string, unknown>;
  }): Promise<SignUpResult>;

  signOut(): Promise<void>;

  /**
   * Returns the signed JWT claims relevant to the app (no network hop on the
   * common path — JWT is verified locally via JWKS cache).
   *
   * This replaces the earlier `getCurrentUserId()` primitive: any code that
   * needs the current user's id should read `.userId` from the returned claims.
   */
  getCurrentAuthClaims(): Promise<AuthIdentityClaims | null>;
}
