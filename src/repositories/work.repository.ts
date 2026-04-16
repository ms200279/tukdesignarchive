import { createServerSupabaseClient } from "@/lib/db/server";
import type { Work } from "@/types/domain";

export type WorkListRow = Pick<
  Work,
  "id" | "title" | "description" | "exhibition_year" | "updated_at"
>;

export async function listWorksForOwner(
  ownerId: string,
): Promise<{ rows: WorkListRow[]; error: Error | null }> {
  const db = await createServerSupabaseClient();
  const { data: rows, error } = await db
    .from("works")
    .select("id, title, description, exhibition_year, updated_at")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });

  if (error) {
    return { rows: [], error: new Error(error.message) };
  }
  return { rows: (rows ?? []) as WorkListRow[], error: null };
}

export async function insertWorkForOwner(params: {
  ownerId: string;
  title: string;
}): Promise<{ id: string } | { error: string }> {
  const db = await createServerSupabaseClient();
  const { data, error } = await db
    .from("works")
    .insert({
      owner_id: params.ownerId,
      title: params.title,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "insert failed" };
  }
  return { id: data.id as string };
}

export async function updateWorkMetadataForOwner(params: {
  ownerId: string;
  workId: string;
  title: string;
  description: string | null;
  exhibition_year: number | null;
}): Promise<{ error: string | null }> {
  const db = await createServerSupabaseClient();
  const { error } = await db
    .from("works")
    .update({
      title: params.title,
      description: params.description,
      exhibition_year: params.exhibition_year,
    })
    .eq("id", params.workId)
    .eq("owner_id", params.ownerId);

  return { error: error?.message ?? null };
}

export async function updateCoverSeriesIdForOwner(params: {
  ownerId: string;
  workId: string;
  coverSeriesId: string;
}): Promise<{ error: string | null }> {
  const db = await createServerSupabaseClient();
  const { error } = await db
    .from("works")
    .update({ cover_series_id: params.coverSeriesId })
    .eq("id", params.workId)
    .eq("owner_id", params.ownerId);

  return { error: error?.message ?? null };
}

export async function getOwnedWorkById(params: {
  ownerId: string;
  workId: string;
}): Promise<{ work: Work | null; error: string | null }> {
  const db = await createServerSupabaseClient();
  const { data: work, error } = await db
    .from("works")
    .select("*")
    .eq("id", params.workId)
    .eq("owner_id", params.ownerId)
    .maybeSingle();

  if (error) {
    return { work: null, error: error.message };
  }
  return { work: work as Work | null, error: null };
}

export type ProfessorWorkListRow = Pick<
  Work,
  "id" | "title" | "exhibition_year" | "updated_at"
> & {
  owner: { display_name: string | null; student_id: string | null } | null;
};

export async function listWorksForProfessor(): Promise<{
  rows: ProfessorWorkListRow[];
  error: Error | null;
}> {
  const db = await createServerSupabaseClient();
  const { data: rows, error } = await db
    .from("works")
    .select(
      "id, title, exhibition_year, updated_at, owner:profiles!works_owner_id_fkey(display_name, student_id)",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    return { rows: [], error: new Error(error.message) };
  }
  return { rows: (rows ?? []) as unknown as ProfessorWorkListRow[], error: null };
}

export type ProfessorWorkDetailRow = Work & {
  owner: { display_name: string | null; student_id: string | null } | null;
};

export async function getWorkByIdForProfessorView(workId: string): Promise<{
  work: ProfessorWorkDetailRow | null;
  error: string | null;
}> {
  const db = await createServerSupabaseClient();
  const { data: work, error } = await db
    .from("works")
    .select(
      "*, owner:profiles!works_owner_id_fkey(display_name, student_id)",
    )
    .eq("id", workId)
    .maybeSingle();

  if (error) {
    return { work: null, error: error.message };
  }
  return {
    work: work as unknown as ProfessorWorkDetailRow | null,
    error: null,
  };
}
