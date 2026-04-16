import { createServerSupabaseClient } from "@/lib/db/server";
import { normalizeWorkFileRow } from "@/lib/work-files-normalize";
import type { WorkFilesRepository } from "@/repositories/ports/work-files-repository.port";
import type { StorageAssetClass, StoredObjectRef, WorkFile } from "@/types/domain";

export class SupabaseWorkFilesRepository implements WorkFilesRepository {
  async listFilesForWork(
    workId: string,
  ): Promise<{ files: WorkFile[]; error: string | null }> {
    const db = await createServerSupabaseClient();
    const { data, error } = await db
      .from("work_files")
      .select("*")
      .eq("work_id", workId)
      .order("created_at", { ascending: true });

    if (error) {
      return { files: [], error: error.message };
    }
    const files = (data ?? []).map((row) =>
      normalizeWorkFileRow(row as unknown as Record<string, unknown>),
    );
    return { files, error: null };
  }

  async listObjectRefsForWork(workId: string): Promise<StoredObjectRef[]> {
    const db = await createServerSupabaseClient();
    const { data, error } = await db
      .from("work_files")
      .select("storage_bucket, storage_path")
      .eq("work_id", workId);

    if (error || !data) {
      return [];
    }
    return data.map((r) => ({
      bucket: String((r as { storage_bucket?: string }).storage_bucket),
      path: String((r as { storage_path?: string }).storage_path),
    }));
  }

  async markSeriesVersionsNotLatest(
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

  async restorePreviousVersionAsLatest(params: {
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

  async getMaxVersionForSeries(seriesId: string): Promise<number> {
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

  async insertWorkFileVersionRow(params: {
    work_id: string;
    storage_bucket: string;
    storage_path: string;
    asset_class: StorageAssetClass;
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
      storage_bucket: params.storage_bucket,
      storage_path: params.storage_path,
      asset_class: params.asset_class,
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

  async insertLegacyOriginalRow(params: {
    work_id: string;
    storage_bucket: string;
    storage_path: string;
    asset_class: StorageAssetClass;
    original_name: string;
    content_type: string | null;
    byte_size: number;
  }): Promise<{ error: string | null }> {
    const db = await createServerSupabaseClient();
    const { error } = await db.from("work_files").insert({
      work_id: params.work_id,
      storage_bucket: params.storage_bucket,
      storage_path: params.storage_path,
      asset_class: params.asset_class,
      original_name: params.original_name,
      content_type: params.content_type,
      byte_size: params.byte_size,
      kind: "original",
    });

    return { error: error?.message ?? null };
  }

  async countLatestFilesByWorkIds(
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
}
