/** Shared object-key rules (bucket comes from config / migrations). */

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
