import { getAuthUserId } from "@/lib/auth/supabase-server-auth";
import { getProfileByUserId } from "@/repositories/profile.repository";
import type { Profile } from "@/types/domain";
import { cache } from "react";

const getSessionProfileCached = cache(async (): Promise<{
  userId: string;
  profile: Profile;
} | null> => {
  const userId = await getAuthUserId();
  if (!userId) {
    return null;
  }

  const profile = await getProfileByUserId(userId);
  if (!profile) {
    return null;
  }

  return { userId, profile };
});

export async function getSessionProfile() {
  return getSessionProfileCached();
}
