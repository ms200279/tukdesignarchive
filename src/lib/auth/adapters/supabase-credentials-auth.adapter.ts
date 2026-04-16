import { createServerSupabaseClient } from "@/lib/db/server";
import type {
  CredentialsAuthPort,
  SignInResult,
  SignUpResult,
} from "@/lib/auth/ports/credentials-auth.port";

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

  async getCurrentUserId(): Promise<string | null> {
    const db = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await db.auth.getUser();
    if (error || !user) return null;
    return user.id;
  }
}
