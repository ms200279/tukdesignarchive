import { createServerSupabaseClient } from "@/lib/db/server";

export async function listFilesForWork(workId: string) {
  const db = await createServerSupabaseClient();
  return db
    .from("work_files")
    .select("*")
    .eq("work_id", workId)
    .order("created_at", { ascending: true });
}

export async function markSeriesVersionsNotLatest(
  workId: string,
  seriesId: string,
): Promise<{ error: string | null }> {
  const db = await createServerSupabaseClient();
  const { error } = await db
    .from("work_files")
    .update({ is_latest: false })
    .eq("work_id", workId)
    .eq("series_id", seriesId);

  return { error: error?.message ?? null };
}

export async function restorePreviousVersionAsLatest(params: {
  workId: string;
  seriesId: string;
  previousVersion: number;
}): Promise<{ error: string | null }> {
  const db = await createServerSupabaseClient();
  const { error } = await db
    .from("work_files")
    .update({ is_latest: true })
    .eq("work_id", params.workId)
    .eq("series_id", params.seriesId)
    .eq("version", params.previousVersion);

  return { error: error?.message ?? null };
}

export async function getMaxVersionForSeries(
  seriesId: string,
): Promise<number> {
  const db = await createServerSupabaseClient();
  const { data: maxRow } = await db
    .from("work_files")
    .select("version")
    .eq("series_id", seriesId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  return maxRow?.version ?? 0;
}

export async function insertWorkFileVersionRow(params: {
  work_id: string;
  storage_path: string;
  original_name: string;
  content_type: string | null;
  byte_size: number;
  kind: "cover" | "original";
  series_id: string;
  version: number;
  is_latest: boolean;
}): Promise<{ error: string | null }> {
  const db = await createServerSupabaseClient();
  const { error } = await db.from("work_files").insert({
    work_id: params.work_id,
    storage_path: params.storage_path,
    original_name: params.original_name,
    content_type: params.content_type,
    byte_size: params.byte_size,
    kind: params.kind,
    series_id: params.series_id,
    version: params.version,
    is_latest: params.is_latest,
  });

  return { error: error?.message ?? null };
}

/** Legacy flat-path uploads (pre-versioned UI). */
export async function insertLegacyOriginalRow(params: {
  work_id: string;
  storage_path: string;
  original_name: string;
  content_type: string | null;
  byte_size: number;
}): Promise<{ error: string | null }> {
  const db = await createServerSupabaseClient();
  const { error } = await db.from("work_files").insert({
    work_id: params.work_id,
    storage_path: params.storage_path,
    original_name: params.original_name,
    content_type: params.content_type,
    byte_size: params.byte_size,
  });

  return { error: error?.message ?? null };
}

export async function countLatestFilesByWorkIds(
  workIds: string[],
): Promise<Record<string, number>> {
  const map: Record<string, number> = {};
  if (workIds.length === 0) return map;

  const db = await createServerSupabaseClient();
  const q = await db
    .from("work_files")
    .select("work_id")
    .eq("is_latest", true)
    .in("work_id", workIds);

  if (q.error) {
    const q2 = await db
      .from("work_files")
      .select("work_id")
      .in("work_id", workIds);
    for (const r of q2.data ?? []) {
      map[r.work_id as string] = (map[r.work_id as string] ?? 0) + 1;
    }
    return map;
  }

  for (const r of q.data ?? []) {
    const wid = r.work_id as string;
    map[wid] = (map[wid] ?? 0) + 1;
  }
  return map;
}
