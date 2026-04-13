import Link from "next/link";
import { notFound } from "next/navigation";
import { updateWorkMetadata } from "../actions";
import { StudentWorkFilesPanel } from "@/components/works/student-work-files-panel";
import { getSessionProfile } from "@/lib/auth/session";
import { normalizeWorkFileRow } from "@/lib/work-files-normalize";
import { createClient } from "@/lib/supabase/server";
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

  const files = (fileRows ?? []).map((row) =>
    normalizeWorkFileRow(row as Record<string, unknown>),
  ) as WorkFile[];

  const w = work as Work & { cover_series_id?: string | null };

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

      <div className="mt-8">
        <StudentWorkFilesPanel
          workId={w.id}
          userId={session.userId}
          initialCoverSeriesId={w.cover_series_id ?? null}
          files={files}
        />
      </div>
    </div>
  );
}
