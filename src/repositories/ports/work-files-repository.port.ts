import type { StoredObjectRef, StorageAssetClass, WorkFile } from "@/types/domain";

export interface WorkFilesRepository {
  listFilesForWork(
    workId: string,
  ): Promise<{ files: WorkFile[]; error: string | null }>;

  listObjectRefsForWork(workId: string): Promise<StoredObjectRef[]>;

  markSeriesVersionsNotLatest(
    workId: string,
    seriesId: string,
  ): Promise<{ error: string | null }>;

  restorePreviousVersionAsLatest(params: {
    workId: string;
    seriesId: string;
    previousVersion: number;
  }): Promise<{ error: string | null }>;

  getMaxVersionForSeries(seriesId: string): Promise<number>;

  insertWorkFileVersionRow(params: {
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
  }): Promise<{ error: string | null }>;

  insertLegacyOriginalRow(params: {
    work_id: string;
    storage_bucket: string;
    storage_path: string;
    asset_class: StorageAssetClass;
    original_name: string;
    content_type: string | null;
    byte_size: number;
  }): Promise<{ error: string | null }>;

  countLatestFilesByWorkIds(
    workIds: string[],
  ): Promise<Record<string, number>>;
}
