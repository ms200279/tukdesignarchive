"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { uploadLegacyOriginalWorkFile } from "@/lib/storage/work-file-server-actions";

export function WorkOriginalUpload({ workId }: { workId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onFile(file: File) {
    setPending(true);
    setMessage(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadLegacyOriginalWorkFile(workId, fd);

    if (!res.ok) {
      setMessage(res.message);
      setPending(false);
      return;
    }

    setPending(false);
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium text-slate-800">원본 파일</div>
          <p className="text-xs text-slate-500">
            업로드한 파일은 변환 없이 보관됩니다. 용량 제한은 Supabase Storage
            설정을 따릅니다.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
          <input
            type="file"
            className="sr-only"
            disabled={pending}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
              e.target.value = "";
            }}
          />
          {pending ? "업로드 중…" : "파일 선택"}
        </label>
      </div>
      {message ? (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
