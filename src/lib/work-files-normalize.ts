import type { WorkFile, WorkFileKind } from "@/types/database";

/** 마이그레이션 전·후 행 모두 안전하게 파싱 */
export function normalizeWorkFileRow(r: Record<string, unknown>): WorkFile {
  const kind: WorkFileKind =
    r.kind === "cover" ? "cover" : "original";
  return {
    id: String(r.id),
    work_id: String(r.work_id),
    storage_path: String(r.storage_path),
    original_name: String(r.original_name),
    content_type: (r.content_type as string | null) ?? null,
    byte_size:
      typeof r.byte_size === "number"
        ? r.byte_size
        : r.byte_size != null
          ? Number(r.byte_size)
          : null,
    kind,
    series_id: String(r.series_id ?? r.id),
    version: typeof r.version === "number" ? r.version : 1,
    is_latest: r.is_latest !== false,
    created_at: String(r.created_at),
  };
}
