import type { StoredObjectRef } from "@/types/domain";

/**
 * Private object storage (upload, delete, time-limited read URLs).
 * Provider-specific SDK usage belongs in adapters only.
 */
export interface ObjectStoragePort {
  upload(params: {
    bucket: string;
    path: string;
    file: File;
  }): Promise<{ error: string | null }>;

  removeObjectRefs(refs: StoredObjectRef[]): Promise<{ error: string | null }>;

  removeObjectRefsChunked(
    refs: StoredObjectRef[],
  ): Promise<{ error: string | null }>;

  createSignedReadUrl(params: {
    bucket: string;
    path: string;
    expiresIn: number;
  }): Promise<{ signedUrl: string | null; error: string | null }>;
}
