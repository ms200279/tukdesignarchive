import { credentialsAuth } from "@/lib/auth/auth-instances";
import { usersRepository } from "@/repositories";
import type { SessionWithProfile } from "@/types/domain";
import { cache } from "react";

const getSessionProfileCached = cache(async (): Promise<SessionWithProfile | null> => {
  const userId = await credentialsAuth.getCurrentUserId();
  if (!userId) {
    return null;
  }

  const profile = await usersRepository.getProfileByUserId(userId);
  if (!profile) {
    return null;
  }

  return { userId, profile };
});

export async function getSessionProfile(): Promise<SessionWithProfile | null> {
  return getSessionProfileCached();
}
