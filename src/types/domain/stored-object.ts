/** Object key within a bucket — never a long-lived public URL. */
export type StoredObjectRef = {
  bucket: string;
  path: string;
};

/** Storage tier: originals vs generated previews vs thumbnails. */
export type StorageAssetClass = "original" | "preview" | "thumbnail";
