import { createServerSupabaseClient } from "@/lib/db/server";
import type { UsersRepository } from "@/repositories/ports/users-repository.port";

export class SupabaseUsersRepository implements UsersRepository {
  async findStudentRegistryIdByProfileId(
    profileId: string,
  ): Promise<number | null> {
    const db = await createServerSupabaseClient();
    const { data, error } = await db
      .from("student_registry")
      .select("id")
      .eq("profile_id", profileId)
      .maybeSingle();

    if (error || !data) return null;
    return typeof data.id === "number" ? data.id : Number(data.id);
  }
}
