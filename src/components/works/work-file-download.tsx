"use client";

import { useState } from "react";
import { signedUrlForWorkFileAsset } from "@/lib/storage/work-file-server-actions";
import type { WorkFile } from "@/types/domain";

function formatBytes(n: number | null) {
  if (n == null || Number.isNaN(n)) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function WorkFileDownload({ file }: { file: WorkFile }) {
  const [busy, setBusy] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);

  async function openSigned() {
    setOpenError(null);
    setBusy(true);
    const res = await signedUrlForWorkFileAsset({
      bucket: file.bucket,
      path: file.path,
    });
    setBusy(false);
    if ("error" in res) {
      setOpenError(res.error);
      return;
    }
    window.open(res.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
      <div className="min-w-0">
        <div className="truncate font-medium text-slate-800">
          {file.original_filename}
        </div>
        <div className="text-xs text-slate-500">
          v{file.version}
          {file.is_latest === false ? " · 이전 버전" : " · 최신"}
          {file.kind === "cover" ? " · 대표" : ""}
          {" · "}
          {formatBytes(file.file_size)}
          {file.mime_type ? ` · ${file.mime_type}` : ""}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => void openSigned()}
          disabled={busy}
          className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {busy ? "열기…" : "원본 열기"}
        </button>
        {openError ? (
          <p className="max-w-[12rem] text-right text-xs text-red-600" role="alert">
            {openError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
