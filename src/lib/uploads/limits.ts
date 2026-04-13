/** 대표 이미지: 이미지 MIME만, 최대 용량 */
export const COVER_MAX_BYTES = 5 * 1024 * 1024;

/** 원본: 허용 목록 기준, 최대 용량 */
export const ORIGINAL_MAX_BYTES = 100 * 1024 * 1024;

const COVER_PREFIXES = ["image/"] as const;

/** 원본: MIME 또는 확장자 허용 (실무에서 운영 정책에 맞게 조정) */
const ORIGINAL_MIME_PREFIXES = [
  "image/",
  "video/",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "model/",
  "text/plain",
] as const;

const ORIGINAL_MIME_EXACT = new Set([
  "application/octet-stream",
  "application/x-7z-compressed",
]);

const ORIGINAL_EXT = new Set([
  "pdf",
  "zip",
  "7z",
  "rar",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "mp4",
  "mov",
  "webm",
  "glb",
  "gltf",
  "obj",
  "fbx",
  "blend",
  "ai",
  "psd",
  "svg",
  "txt",
  "csv",
]);

function fileExt(name: string) {
  const i = name.lastIndexOf(".");
  if (i < 0) return "";
  return name.slice(i + 1).toLowerCase();
}

export function formatMaxBytes(n: number) {
  if (n >= 1024 * 1024) return `${Math.round(n / (1024 * 1024))}MB`;
  if (n >= 1024) return `${Math.round(n / 1024)}KB`;
  return `${n}B`;
}

export function validateCoverFile(file: File): string | null {
  if (file.size > COVER_MAX_BYTES) {
    return `대표 이미지는 ${formatMaxBytes(COVER_MAX_BYTES)} 이하여야 합니다. (현재 ${formatMaxBytes(file.size)})`;
  }
  const ok = COVER_PREFIXES.some((p) => file.type.startsWith(p));
  if (!ok) {
    return "대표 이미지는 이미지 파일만 업로드할 수 있습니다.";
  }
  return null;
}

export function validateOriginalFile(file: File): string | null {
  if (file.size > ORIGINAL_MAX_BYTES) {
    return `원본 파일은 ${formatMaxBytes(ORIGINAL_MAX_BYTES)} 이하여야 합니다. (${file.name}: ${formatMaxBytes(file.size)})`;
  }
  const t = file.type || "";
  if (ORIGINAL_MIME_EXACT.has(t)) {
    const ext = fileExt(file.name);
    if (ORIGINAL_EXT.has(ext)) return null;
  }
  if (ORIGINAL_MIME_PREFIXES.some((p) => t.startsWith(p))) {
    return null;
  }
  const ext = fileExt(file.name);
  if (ORIGINAL_EXT.has(ext)) {
    return null;
  }
  return `허용되지 않는 형식입니다: ${file.name} (${t || "타입 없음"})`;
}

export function uploadHints() {
  return {
    cover: `이미지, 최대 ${formatMaxBytes(COVER_MAX_BYTES)}`,
    original: `PDF·이미지·영상·ZIP 등, 파일당 최대 ${formatMaxBytes(ORIGINAL_MAX_BYTES)}`,
  };
}
