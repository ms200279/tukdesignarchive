import { createServerSupabaseClient } from "@/lib/db/server";

export async function signInWithPassword(params: {
  email: string;
  password: string;
}) {
  const db = await createServerSupabaseClient();
  return db.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });
}

export async function signUpWithEmail(params: {
  email: string;
  password: string;
  metadata: Record<string, unknown>;
}) {
  const db = await createServerSupabaseClient();
  return db.auth.signUp({
    email: params.email,
    password: params.password,
    options: { data: params.metadata },
  });
}

export async function signOutEverywhere() {
  const db = await createServerSupabaseClient();
  return db.auth.signOut();
}

export async function getAuthUserId(): Promise<string | null> {
  const db = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) return null;
  return user.id;
}
