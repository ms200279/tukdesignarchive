import { workFilesBucket } from "@/config";
import type { ObjectStoragePort } from "@/lib/storage/ports/object-storage.port";
import {
  buildLegacyFlatOriginalStoragePath,
  buildVersionedWorkFileStoragePath,
  sanitizeWorkFilename,
} from "@/lib/storage/paths";
import type {
  StoredObjectRef,
  StorageAssetClass,
  WorkFileKind,
} from "@/types/domain";

/**
 * Application-level storage for work files: path rules, bucket defaults,
 * and mapping from product pipeline (`kind`) to storage tier (`asset_class`).
 */
export class WorkFileStorageService {
  constructor(private readonly backing: ObjectStoragePort) {}

  defaultBucket(): string {
    return workFilesBucket();
  }

  /** `cover` 대표 이미지 → preview 계층, 제출 원본 → original 계층. */
  assetClassForPipelineKind(kind: WorkFileKind): StorageAssetClass {
    return kind === "cover" ? "preview" : "original";
  }

  buildVersionedObjectPath(params: {
    userId: string;
    workId: string;
    kind: WorkFileKind;
    seriesId: string;
    version: number;
    originalFilename: string;
    maxSafeNameLength: number;
  }): string {
    const safe = sanitizeWorkFilename(
      params.originalFilename,
      params.maxSafeNameLength,
    );
    return buildVersionedWorkFileStoragePath({
      userId: params.userId,
      workId: params.workId,
      kind: params.kind,
      seriesId: params.seriesId,
      version: params.version,
      safeName: safe,
    });
  }

  buildLegacyOriginalObjectPath(params: {
    userId: string;
    workId: string;
    uniqueId: string;
    originalFilename: string;
    maxSafeNameLength: number;
  }): string {
    const safe = sanitizeWorkFilename(
      params.originalFilename,
      params.maxSafeNameLength,
    );
    return buildLegacyFlatOriginalStoragePath({
      userId: params.userId,
      workId: params.workId,
      uniqueId: params.uniqueId,
      safeName: safe,
    });
  }

  /** 향후 썸네일 파생본 전용 경로 (현재 업로드 경로와 분리). */
  buildThumbnailObjectPath(params: {
    userId: string;
    workId: string;
    seriesId: string;
    version: number;
    safeName: string;
  }): string {
    return `${params.userId}/${params.workId}/thumbnail/${params.seriesId}/v${params.version}_${params.safeName}`;
  }

  ref(bucket: string, path: string): StoredObjectRef {
    return { bucket, path };
  }

  async putObject(ref: StoredObjectRef, file: File) {
    return this.backing.upload({
      bucket: ref.bucket,
      path: ref.path,
      file,
    });
  }

  async createSignedReadUrl(ref: StoredObjectRef, expiresIn: number) {
    return this.backing.createSignedReadUrl({
      bucket: ref.bucket,
      path: ref.path,
      expiresIn,
    });
  }

  async deleteObjects(refs: StoredObjectRef[]) {
    return this.backing.removeObjectRefsChunked(refs);
  }
}
