import { createServerSupabaseClient } from "@/lib/db/server";
import type { Profile } from "@/types/domain";

export async function getProfileByUserId(
  userId: string,
): Promise<Profile | null> {
  const db = await createServerSupabaseClient();
  const { data: profile, error } = await db
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile) {
    return null;
  }
  return profile as Profile;
}
