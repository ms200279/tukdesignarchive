import { createServerSupabaseClient } from "@/lib/db/server";

export async function findRegistryIdByProfileId(
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
