"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { WORK_FILES_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

function sanitizeFilename(name: string) {
  return name.replace(/[^\w.\-()가-힣]/g, "_").slice(0, 180);
}

export function WorkOriginalUpload({
  workId,
  userId,
}: {
  workId: string;
  userId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onFile(file: File) {
    setPending(true);
    setMessage(null);
    const supabase = createClient();
    const id = crypto.randomUUID();
    const safe = sanitizeFilename(file.name);
    const path = `${userId}/${workId}/${id}_${safe}`;

    const { error: uploadError } = await supabase.storage
      .from(WORK_FILES_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      setMessage(uploadError.message);
      setPending(false);
      return;
    }

    const { error: insertError } = await supabase.from("work_files").insert({
      work_id: workId,
      storage_path: path,
      original_name: file.name,
      content_type: file.type || null,
      byte_size: file.size,
    });

    if (insertError) {
      await supabase.storage.from(WORK_FILES_BUCKET).remove([path]);
      setMessage(insertError.message);
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
