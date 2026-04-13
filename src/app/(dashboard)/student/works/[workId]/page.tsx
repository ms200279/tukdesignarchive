import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteWorkFile, updateWorkMetadata } from "../actions";
import { getSessionProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { WorkFileDownload } from "@/components/works/work-file-download";
import { WorkOriginalUpload } from "@/components/works/work-original-upload";
import type { Work, WorkFile } from "@/types/database";

export default async function StudentWorkDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ workId: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { workId } = await params;
  const sp = await searchParams;
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "student") {
    notFound();
  }

  const supabase = await createClient();
  const { data: work, error } = await supabase
    .from("works")
    .select("*")
    .eq("id", workId)
    .eq("owner_id", session.userId)
    .maybeSingle();

  if (error || !work) {
    notFound();
  }

  const { data: fileRows } = await supabase
    .from("work_files")
    .select("*")
    .eq("work_id", workId)
    .order("created_at", { ascending: true });

  const files = (fileRows ?? []) as WorkFile[];
  const w = work as Work;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/student"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← 목록
        </Link>
      </div>

      <h1 className="mt-4 text-lg font-semibold text-slate-900">작품 편집</h1>

      {sp.saved ? (
        <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          저장되었습니다.
        </p>
      ) : null}
      {sp.error === "save" ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          저장에 실패했습니다.
        </p>
      ) : null}
      {sp.error === "file" ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          파일 처리에 실패했습니다.
        </p>
      ) : null}

      <form
        action={updateWorkMetadata}
        className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <input type="hidden" name="workId" value={w.id} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm font-medium text-slate-700">
            제목
          </label>
          <input
            id="title"
            name="title"
            defaultValue={w.title}
            required
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="description"
            className="text-sm font-medium text-slate-700"
          >
            설명
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={w.description ?? ""}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="exhibition_year"
            className="text-sm font-medium text-slate-700"
          >
            전시 연도
          </label>
          <input
            id="exhibition_year"
            name="exhibition_year"
            type="number"
            defaultValue={w.exhibition_year ?? ""}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
            placeholder="2026"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            저장
          </button>
        </div>
      </form>

      <div className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">첨부 원본</h2>
        <WorkOriginalUpload workId={w.id} userId={session.userId} />
        <div className="space-y-2">
          {files.length === 0 ? (
            <p className="text-sm text-slate-500">아직 업로드된 파일이 없습니다.</p>
          ) : (
            files.map((f) => (
              <div key={f.id} className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <div className="min-w-0 flex-1">
                  <WorkFileDownload file={f} />
                </div>
                <form action={deleteWorkFile} className="shrink-0">
                  <input type="hidden" name="workId" value={w.id} />
                  <input type="hidden" name="fileId" value={f.id} />
                  <button
                    type="submit"
                    className="h-full w-full rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 sm:w-auto"
                  >
                    삭제
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
