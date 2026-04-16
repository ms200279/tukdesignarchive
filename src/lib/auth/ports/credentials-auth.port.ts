/**
 * Email/password auth at the application boundary.
 * Supabase Auth (or any IdP) lives only in the adapter implementation.
 */

export type AuthErrorLike = {
  message?: string;
  code?: string;
  status?: number;
};

export type SignInResult = { ok: true } | { ok: false; error: AuthErrorLike };

export type SignUpResult =
  | { ok: true; identitiesCount: number }
  | { ok: false; error: AuthErrorLike };

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

  getCurrentUserId(): Promise<string | null>;
}
