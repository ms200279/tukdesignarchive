"use server";

import { getSessionProfile } from "@/lib/auth/session";
import {
  coverPreviewSignedUrlTtlSeconds,
  workFileDownloadSignedUrlTtlSeconds,
} from "@/config/env";
import {
  buildLegacyFlatOriginalStoragePath,
  buildVersionedWorkFileStoragePath,
  sanitizeWorkFilename,
} from "@/lib/storage/paths";
import {
  createSignedReadUrl,
  removeStoragePaths,
  uploadBytesAtPath,
} from "@/lib/storage/supabase-work-files-storage";
import * as workFileRepo from "@/repositories/work-file.repository";
import * as workRepo from "@/repositories/work.repository";

export async function signedUrlForWorkFileStoragePath(
  objectPath: string,
  expiresInSeconds?: number,
): Promise<{ signedUrl: string } | { error: string }> {
  const session = await getSessionProfile();
  if (!session) {
    return { error: "로그인이 필요합니다." };
  }

  const ttl =
    expiresInSeconds ?? workFileDownloadSignedUrlTtlSeconds();
  const { signedUrl, error } = await createSignedReadUrl({
    path: objectPath,
    expiresIn: ttl,
  });
  if (error || !signedUrl) {
    return { error: error ?? "signed url failed" };
  }
  return { signedUrl };
}

export async function signedUrlForCoverPreview(
  objectPath: string,
): Promise<{ signedUrl: string } | { error: string }> {
  return signedUrlForWorkFileStoragePath(
    objectPath,
    coverPreviewSignedUrlTtlSeconds(),
  );
}

export async function assignCoverSeriesForWork(
  workId: string,
): Promise<{ seriesId: string } | { error: string }> {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "student") {
    return { error: "권한이 없습니다." };
  }

  const seriesId = crypto.randomUUID();
  const { error } = await workRepo.updateCoverSeriesIdForOwner({
    ownerId: session.userId,
    workId,
    coverSeriesId: seriesId,
  });
  if (error) {
    return { error };
  }
  return { seriesId };
}

export async function uploadWorkFileVersion(
  workId: string,
  kind: "cover" | "original",
  seriesId: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "student") {
    return { ok: false, message: "권한이 없습니다." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "파일이 없습니다." };
  }

  const userId = session.userId;

  const bump = await workFileRepo.markSeriesVersionsNotLatest(workId, seriesId);
  if (bump.error) {
    return { ok: false, message: bump.error };
  }

  const maxVersion = await workFileRepo.getMaxVersionForSeries(seriesId);
  const nextVersion = maxVersion + 1;
  const safe = sanitizeWorkFilename(file.name, 160);
  const path = buildVersionedWorkFileStoragePath({
    userId,
    workId,
    kind,
    seriesId,
    version: nextVersion,
    safeName: safe,
  });

  const up = await uploadBytesAtPath({ path, file });
  if (up.error) {
    if (nextVersion > 1) {
      await workFileRepo.restorePreviousVersionAsLatest({
        workId,
        seriesId,
        previousVersion: nextVersion - 1,
      });
    }
    return { ok: false, message: up.error };
  }

  const ins = await workFileRepo.insertWorkFileVersionRow({
    work_id: workId,
    storage_path: path,
    original_name: file.name,
    content_type: file.type || null,
    byte_size: file.size,
    kind,
    series_id: seriesId,
    version: nextVersion,
    is_latest: true,
  });

  if (ins.error) {
    await removeStoragePaths([path]);
    if (nextVersion > 1) {
      await workFileRepo.restorePreviousVersionAsLatest({
        workId,
        seriesId,
        previousVersion: nextVersion - 1,
      });
    }
    return { ok: false, message: ins.error };
  }

  return { ok: true };
}

export async function uploadLegacyOriginalWorkFile(
  workId: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "student") {
    return { ok: false, message: "권한이 없습니다." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "파일이 없습니다." };
  }

  const userId = session.userId;
  const uniqueId = crypto.randomUUID();
  const safe = sanitizeWorkFilename(file.name, 180);
  const path = buildLegacyFlatOriginalStoragePath({
    userId,
    workId,
    uniqueId,
    safeName: safe,
  });

  const up = await uploadBytesAtPath({ path, file });
  if (up.error) {
    return { ok: false, message: up.error };
  }

  const ins = await workFileRepo.insertLegacyOriginalRow({
    work_id: workId,
    storage_path: path,
    original_name: file.name,
    content_type: file.type || null,
    byte_size: file.size,
  });

  if (ins.error) {
    await removeStoragePaths([path]);
    return { ok: false, message: ins.error };
  }

  return { ok: true };
}
