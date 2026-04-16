import { createServerSupabaseClient } from "@/lib/db/server";
import type { UsersRepository } from "@/repositories/ports/users-repository.port";
import type { Profile } from "@/types/domain";

function mapProfileRow(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id),
    role: row.role === "professor" ? "professor" : "student",
    student_id: row.student_id != null ? String(row.student_id) : null,
    display_name: row.display_name != null ? String(row.display_name) : null,
    created_at: String(row.created_at),
  };
}

export class SupabaseUsersRepository implements UsersRepository {
  async getProfileByUserId(userId: string): Promise<Profile | null> {
    const db = await createServerSupabaseClient();
    const { data: profile, error } = await db
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error || !profile) {
      return null;
    }
    return mapProfileRow(profile as unknown as Record<string, unknown>);
  }

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
