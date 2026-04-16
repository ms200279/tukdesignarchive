import { SupabaseObjectStorageAdapter } from "@/lib/storage/adapters/supabase-object-storage.adapter";
import type { ObjectStoragePort } from "@/lib/storage/ports/object-storage.port";
import { WorkFileStorageService } from "@/lib/storage/work-file-storage.service";

export const objectStorage: ObjectStoragePort =
  new SupabaseObjectStorageAdapter();

/** Work file path rules + bucket + signed URL entry (uses `objectStorage`). */
export const workFileStorage = new WorkFileStorageService(objectStorage);
