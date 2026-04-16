import type { Profile } from "@/types/domain";

export interface UsersRepository {
  getProfileByUserId(userId: string): Promise<Profile | null>;
  findStudentRegistryIdByProfileId(profileId: string): Promise<number | null>;
}
