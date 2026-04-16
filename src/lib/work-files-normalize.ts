import { workFilesBucket } from "@/config/env";
import type { StorageAssetClass, WorkFile, WorkFileKind } from "@/types/domain";

function coerceAssetClass(
  raw: unknown,
  kind: WorkFileKind,
): StorageAssetClass {
  if (raw === "thumbnail" || raw === "preview" || raw === "original") {
    return raw;
  }
  return kind === "cover" ? "preview" : "original";
}

/** 마이그레이션 전·후 행 모두 안전하게 파싱 → 도메인 정규 모델 */
export function normalizeWorkFileRow(r: Record<string, unknown>): WorkFile {
  const kind: WorkFileKind =
    r.kind === "cover" ? "cover" : "original";
  const path = String(r.storage_path ?? r.path ?? "");
  const bucket =
    typeof r.storage_bucket === "string" && r.storage_bucket.length > 0
      ? r.storage_bucket
      : workFilesBucket();

  return {
    id: String(r.id),
    work_id: String(r.work_id),
    bucket,
    path,
    original_filename: String(r.original_name ?? r.original_filename ?? ""),
    mime_type: (r.content_type as string | null) ?? (r.mime_type as string | null) ?? null,
    file_size:
      typeof r.byte_size === "number"
        ? r.byte_size
        : typeof r.file_size === "number"
          ? r.file_size
          : r.byte_size != null
            ? Number(r.byte_size)
            : r.file_size != null
              ? Number(r.file_size)
              : null,
    kind,
    series_id: String(r.series_id ?? r.id),
    version: typeof r.version === "number" ? r.version : 1,
    is_latest: r.is_latest !== false,
    uploaded_at: String(r.created_at ?? r.uploaded_at ?? ""),
    asset_class: coerceAssetClass(r.asset_class, kind),
  };
}
