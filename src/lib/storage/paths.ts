/**
 * Object key layout (Supabase Storage / S3 호환).
 *
 * 현재 물리 경로는 `userId/workId/{kind}/...` 형태를 유지합니다 (`kind`: cover | original).
 * DB의 `asset_class`(original | preview | thumbnail)는 저장 계층 메타데이터로,
 * 대표 이미지(cover)는 preview, 제출 원본은 original에 매핑됩니다.
 */

export function sanitizeWorkFilename(name: string, maxLen: number) {
  return name.replace(/[^\w.\-()가-힣]/g, "_").slice(0, maxLen);
}

export function buildVersionedWorkFileStoragePath(params: {
  userId: string;
  workId: string;
  kind: "cover" | "original";
  seriesId: string;
  version: number;
  safeName: string;
}) {
  const { userId, workId, kind, seriesId, version, safeName } = params;
  return `${userId}/${workId}/${kind}/${seriesId}/v${version}_${safeName}`;
}

/** Legacy single-segment file id layout used by older upload UI. */
export function buildLegacyFlatOriginalStoragePath(params: {
  userId: string;
  workId: string;
  uniqueId: string;
  safeName: string;
}) {
  return `${params.userId}/${params.workId}/${params.uniqueId}_${params.safeName}`;
}
