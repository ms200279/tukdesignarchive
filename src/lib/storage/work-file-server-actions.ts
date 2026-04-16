"use server";

import { getSessionProfile } from "@/lib/auth/session";
import { isStudentSession } from "@/lib/auth/role-guards";
import {
  coverPreviewSignedUrlTtlSeconds,
  workFileDownloadSignedUrlTtlSeconds,
} from "@/config/env";
import { workFileStorage } from "@/lib/storage/storage-instances";
import type { StoredObjectRef } from "@/types/domain";
import { worksRepository, workFilesRepository } from "@/repositories";

export async function signedUrlForWorkFileAsset(
  ref: StoredObjectRef,
  expiresInSeconds?: number,
): Promise<{ signedUrl: string } | { error: string }> {
  const session = await getSessionProfile();
  if (!session) {
    return { error: "로그인이 필요합니다." };
  }

  const ttl =
    expiresInSeconds ?? workFileDownloadSignedUrlTtlSeconds();
  const { signedUrl, error } = await workFileStorage.createSignedReadUrl(
    ref,
    ttl,
  );
  if (error || !signedUrl) {
    return { error: error ?? "signed url failed" };
  }
  return { signedUrl };
}

export async function signedUrlForCoverPreview(
  ref: StoredObjectRef,
): Promise<{ signedUrl: string } | { error: string }> {
  return signedUrlForWorkFileAsset(ref, coverPreviewSignedUrlTtlSeconds());
}

export async function assignCoverSeriesForWork(
  workId: string,
): Promise<{ seriesId: string } | { error: string }> {
  const session = await getSessionProfile();
  if (!isStudentSession(session)) {
    return { error: "권한이 없습니다." };
  }

  const seriesId = crypto.randomUUID();
  const { error } = await worksRepository.updateCoverSeriesIdForOwner({
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
  if (!isStudentSession(session)) {
    return { ok: false, message: "권한이 없습니다." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "파일이 없습니다." };
  }

  const userId = session.userId;
  const bucket = workFileStorage.defaultBucket();
  const assetClass = workFileStorage.assetClassForPipelineKind(kind);

  const bump = await workFilesRepository.markSeriesVersionsNotLatest(
    workId,
    seriesId,
  );
  if (bump.error) {
    return { ok: false, message: bump.error };
  }

  const maxVersion = await workFilesRepository.getMaxVersionForSeries(seriesId);
  const nextVersion = maxVersion + 1;
  const path = workFileStorage.buildVersionedObjectPath({
    userId,
    workId,
    kind,
    seriesId,
    version: nextVersion,
    originalFilename: file.name,
    maxSafeNameLength: 160,
  });

  const ref = workFileStorage.ref(bucket, path);
  const up = await workFileStorage.putObject(ref, file);
  if (up.error) {
    if (nextVersion > 1) {
      await workFilesRepository.restorePreviousVersionAsLatest({
        workId,
        seriesId,
        previousVersion: nextVersion - 1,
      });
    }
    return { ok: false, message: up.error };
  }

  const ins = await workFilesRepository.insertWorkFileVersionRow({
    work_id: workId,
    storage_bucket: bucket,
    storage_path: path,
    asset_class: assetClass,
    original_name: file.name,
    content_type: file.type || null,
    byte_size: file.size,
    kind,
    series_id: seriesId,
    version: nextVersion,
    is_latest: true,
  });

  if (ins.error) {
    await workFileStorage.deleteObjects([ref]);
    if (nextVersion > 1) {
      await workFilesRepository.restorePreviousVersionAsLatest({
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
  if (!isStudentSession(session)) {
    return { ok: false, message: "권한이 없습니다." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "파일이 없습니다." };
  }

  const userId = session.userId;
  const uniqueId = crypto.randomUUID();
  const bucket = workFileStorage.defaultBucket();
  const path = workFileStorage.buildLegacyOriginalObjectPath({
    userId,
    workId,
    uniqueId,
    originalFilename: file.name,
    maxSafeNameLength: 180,
  });

  const ref = workFileStorage.ref(bucket, path);
  const up = await workFileStorage.putObject(ref, file);
  if (up.error) {
    return { ok: false, message: up.error };
  }

  const ins = await workFilesRepository.insertLegacyOriginalRow({
    work_id: workId,
    storage_bucket: bucket,
    storage_path: path,
    asset_class: "original",
    original_name: file.name,
    content_type: file.type || null,
    byte_size: file.size,
  });

  if (ins.error) {
    await workFileStorage.deleteObjects([ref]);
    return { ok: false, message: ins.error };
  }

  return { ok: true };
}
