import { createServerSupabaseClient } from "@/lib/db/server";
import type { ObjectStoragePort } from "@/lib/storage/ports/object-storage.port";
import type { StoredObjectRef } from "@/types/domain";

const REMOVE_CHUNK_SIZE = 100;

function groupPathsByBucket(refs: StoredObjectRef[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const ref of refs) {
    const list = map.get(ref.bucket) ?? [];
    list.push(ref.path);
    map.set(ref.bucket, list);
  }
  return map;
}

export class SupabaseObjectStorageAdapter implements ObjectStoragePort {
  async upload(params: {
    bucket: string;
    path: string;
    file: File;
  }): Promise<{ error: string | null }> {
    const db = await createServerSupabaseClient();
    const { error } = await db.storage
      .from(params.bucket)
      .upload(params.path, params.file, {
        cacheControl: "3600",
        upsert: false,
        contentType: params.file.type || undefined,
      });
    return { error: error?.message ?? null };
  }

  async removeObjectRefs(refs: StoredObjectRef[]): Promise<{ error: string | null }> {
    if (refs.length === 0) return { error: null };
    const db = await createServerSupabaseClient();
    const byBucket = groupPathsByBucket(refs);
    for (const [bucket, paths] of byBucket) {
      const { error } = await db.storage.from(bucket).remove(paths);
      if (error) {
        return { error: error.message };
      }
    }
    return { error: null };
  }

  async removeObjectRefsChunked(
    refs: StoredObjectRef[],
  ): Promise<{ error: string | null }> {
    const unique = new Map<string, StoredObjectRef>();
    for (const ref of refs) {
      unique.set(`${ref.bucket}::${ref.path}`, ref);
    }
    const list = [...unique.values()];
    for (let i = 0; i < list.length; i += REMOVE_CHUNK_SIZE) {
      const chunk = list.slice(i, i + REMOVE_CHUNK_SIZE);
      const { error } = await this.removeObjectRefs(chunk);
      if (error) {
        return { error };
      }
    }
    return { error: null };
  }

  async createSignedReadUrl(params: {
    bucket: string;
    path: string;
    expiresIn: number;
  }): Promise<{ signedUrl: string | null; error: string | null }> {
    const db = await createServerSupabaseClient();
    const { data, error } = await db.storage
      .from(params.bucket)
      .createSignedUrl(params.path, params.expiresIn);

    if (error || !data?.signedUrl) {
      return { signedUrl: null, error: error?.message ?? "signed url failed" };
    }
    return { signedUrl: data.signedUrl, error: null };
  }
}
