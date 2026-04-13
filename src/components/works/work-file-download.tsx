"use client";

import { useState } from "react";
import { WORK_FILES_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { WorkFile } from "@/types/database";

function formatBytes(n: number | null) {
  if (n == null || Number.isNaN(n)) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function WorkFileDownload({ file }: { file: WorkFile }) {
  const [busy, setBusy] = useState(false);

  async function openSigned() {
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(WORK_FILES_BUCKET)
      .createSignedUrl(file.storage_path, 60 * 30);

    setBusy(false);
    if (error || !data?.signedUrl) return;
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
      <div className="min-w-0">
        <div className="truncate font-medium text-slate-800">
          {file.original_name}
        </div>
        <div className="text-xs text-slate-500">
          v{"version" in file ? file.version : 1}
          {"is_latest" in file && file.is_latest === false
            ? " · 이전 버전"
            : " · 최신"}
          {"kind" in file && file.kind === "cover" ? " · 대표" : ""}
          {" · "}
          {formatBytes(file.byte_size)}
          {file.content_type ? ` · ${file.content_type}` : ""}
        </div>
      </div>
      <button
        type="button"
        onClick={() => void openSigned()}
        disabled={busy}
        className="shrink-0 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        {busy ? "열기…" : "원본 열기"}
      </button>
    </div>
  );
}
