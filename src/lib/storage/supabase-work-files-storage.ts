import { workFilesBucket } from "@/config/env";
import { createServerSupabaseClient } from "@/lib/db/server";

export async function uploadBytesAtPath(params: {
  path: string;
  file: File;
}): Promise<{ error: string | null }> {
  const db = await createServerSupabaseClient();
  const { error } = await db.storage.from(workFilesBucket()).upload(params.path, params.file, {
    cacheControl: "3600",
    upsert: false,
    contentType: params.file.type || undefined,
  });
  return { error: error?.message ?? null };
}

export async function removeStoragePaths(
  paths: string[],
): Promise<{ error: string | null }> {
  if (paths.length === 0) return { error: null };
  const db = await createServerSupabaseClient();
  const { error } = await db.storage.from(workFilesBucket()).remove(paths);
  return { error: error?.message ?? null };
}

export async function createSignedReadUrl(params: {
  path: string;
  expiresIn: number;
}): Promise<{ signedUrl: string | null; error: string | null }> {
  const db = await createServerSupabaseClient();
  const { data, error } = await db.storage
    .from(workFilesBucket())
    .createSignedUrl(params.path, params.expiresIn);

  if (error || !data?.signedUrl) {
    return { signedUrl: null, error: error?.message ?? "signed url failed" };
  }
  return { signedUrl: data.signedUrl, error: null };
}
