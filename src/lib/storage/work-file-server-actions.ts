"use server";

import { getAuthIdentity, isStudentIdentity } from "@/lib/auth/session";
import {
  coverPreviewSignedUrlTtlSeconds,
  workFileDownloadSignedUrlTtlSeconds,
} from "@/config";
import { workFileStorage } from "@/lib/storage/storage-instances";
import type {
  StorageAssetClass,
  StoredObjectRef,
  WorkFileKind,
} from "@/types/domain";
import { worksRepository, workFilesRepository } from "@/repositories";

/**
 * 물리 경로 생성에 쓰는 파일명 길이 상한. Supabase 객체 key 전체 길이(1024)와
 * 경로 구성 요소를 고려한 여유값.
 */
const MAX_SAFE_NAME_LENGTH = 160;

export async function signedUrlForWorkFileAsset(
  ref: StoredObjectRef,
  expiresInSeconds?: number,
): Promise<{ signedUrl: string } | { error: string }> {
  const identity = await getAuthIdentity();
  if (!identity) {
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
  const identity = await getAuthIdentity();
  if (!isStudentIdentity(identity)) {
    return { error: "권한이 없습니다." };
  }

  const seriesId = crypto.randomUUID();
  const { error } = await worksRepository.updateCoverSeriesIdForOwner({
    ownerId: identity.userId,
    workId,
    coverSeriesId: seriesId,
  });
  if (error) {
    return { error };
  }
  return { seriesId };
}

/**
 * 1단계: 다음 버전을 예약하고 업로드 대상 경로를 돌려준다.
 *
 * - 학생 본인 경로(`auth.uid()/...`)만 반환하므로 Storage RLS 정책과 합치한다.
 * - 기존 `is_latest=true`를 false로 눌러두고 신규 버전번호를 확보해둔다.
 *   업로드가 끝나면 `commitWorkFileVersion`으로 확정하고, 실패 시
 *   `rollbackWorkFileVersion`으로 원복해 이전 버전을 다시 latest로 세운다.
 * - 파일 자체는 서버를 지나가지 않으므로 Vercel 함수 body 한도와 무관.
 */
export async function reserveWorkFileVersion(params: {
  workId: string;
  kind: WorkFileKind;
  seriesId: string;
  originalFilename: string;
}): Promise<
  | {
      ok: true;
      bucket: string;
      path: string;
      version: number;
      assetClass: StorageAssetClass;
    }
  | { ok: false; message: string }
> {
  const identity = await getAuthIdentity();
  if (!isStudentIdentity(identity)) {
    return { ok: false, message: "권한이 없습니다." };
  }

  const { workId, kind, seriesId, originalFilename } = params;
  if (!workId || !seriesId || !originalFilename) {
    return { ok: false, message: "업로드 요청이 올바르지 않습니다." };
  }

  const bump = await workFilesRepository.markSeriesVersionsNotLatest(
    workId,
    seriesId,
  );
  if (bump.error) {
    return { ok: false, message: bump.error };
  }

  const maxVersion = await workFilesRepository.getMaxVersionForSeries(seriesId);
  const nextVersion = maxVersion + 1;

  const bucket = workFileStorage.defaultBucket();
  const assetClass = workFileStorage.assetClassForPipelineKind(kind);
  const path = workFileStorage.buildVersionedObjectPath({
    userId: identity.userId,
    workId,
    kind,
    seriesId,
    version: nextVersion,
    originalFilename,
    maxSafeNameLength: MAX_SAFE_NAME_LENGTH,
  });

  return { ok: true, bucket, path, version: nextVersion, assetClass };
}

/**
 * 2단계: 브라우저가 Storage 업로드를 성공한 뒤 호출한다. DB 메타만 저장한다.
 *
 * 경로·에셋클래스·버킷은 **서버에서 재파생**해 클라이언트가 들고온 값과 맞는지
 * 검증한다 (학생 본인 경로 이외는 Storage RLS가 먼저 막지만, DB 메타 조작 시도
 * 방지를 위해 한 번 더 차단).
 */
export async function commitWorkFileVersion(params: {
  workId: string;
  kind: WorkFileKind;
  seriesId: string;
  version: number;
  originalFilename: string;
  contentType: string | null;
  byteSize: number;
  bucket: string;
  path: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const identity = await getAuthIdentity();
  if (!isStudentIdentity(identity)) {
    return { ok: false, message: "권한이 없습니다." };
  }

  const {
    workId,
    kind,
    seriesId,
    version,
    originalFilename,
    contentType,
    byteSize,
    bucket,
    path,
  } = params;

  if (!workId || !seriesId || !originalFilename || version < 1 || byteSize < 0) {
    return { ok: false, message: "업로드 요청이 올바르지 않습니다." };
  }

  const expectedBucket = workFileStorage.defaultBucket();
  const expectedPath = workFileStorage.buildVersionedObjectPath({
    userId: identity.userId,
    workId,
    kind,
    seriesId,
    version,
    originalFilename,
    maxSafeNameLength: MAX_SAFE_NAME_LENGTH,
  });
  if (bucket !== expectedBucket || path !== expectedPath) {
    return { ok: false, message: "업로드 경로가 예약 값과 다릅니다." };
  }

  const assetClass = workFileStorage.assetClassForPipelineKind(kind);

  const ins = await workFilesRepository.insertWorkFileVersionRow({
    work_id: workId,
    storage_bucket: bucket,
    storage_path: path,
    asset_class: assetClass,
    original_name: originalFilename,
    content_type: contentType,
    byte_size: byteSize,
    kind,
    series_id: seriesId,
    version,
    is_latest: true,
  });

  if (ins.error) {
    const ref = workFileStorage.ref(bucket, path);
    await workFileStorage.deleteObjects([ref]);
    if (version > 1) {
      await workFilesRepository.restorePreviousVersionAsLatest({
        workId,
        seriesId,
        previousVersion: version - 1,
      });
    }
    return { ok: false, message: ins.error };
  }

  return { ok: true };
}

/**
 * 보조: 브라우저 업로드 실패 시 호출해 예약 상태를 되돌린다.
 *
 * - Storage에 부분 업로드된 객체가 있다면 베스트 에포트로 삭제한다.
 * - 이전 버전이 있었다면 다시 `is_latest=true`로 복원한다.
 * - 버전 1이면 복원할 이전 버전이 없으므로 Storage만 청소한다.
 */
export async function rollbackWorkFileVersion(params: {
  workId: string;
  kind: WorkFileKind;
  seriesId: string;
  version: number;
  originalFilename: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const identity = await getAuthIdentity();
  if (!isStudentIdentity(identity)) {
    return { ok: false, message: "권한이 없습니다." };
  }

  const { workId, kind, seriesId, version, originalFilename } = params;
  if (!workId || !seriesId || !originalFilename || version < 1) {
    return { ok: false, message: "롤백 요청이 올바르지 않습니다." };
  }

  const bucket = workFileStorage.defaultBucket();
  const path = workFileStorage.buildVersionedObjectPath({
    userId: identity.userId,
    workId,
    kind,
    seriesId,
    version,
    originalFilename,
    maxSafeNameLength: MAX_SAFE_NAME_LENGTH,
  });

  await workFileStorage.deleteObjects([workFileStorage.ref(bucket, path)]);

  if (version > 1) {
    await workFilesRepository.restorePreviousVersionAsLatest({
      workId,
      seriesId,
      previousVersion: version - 1,
    });
  }

  return { ok: true };
}
