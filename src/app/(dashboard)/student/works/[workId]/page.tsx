import Link from "next/link";
import { notFound } from "next/navigation";
import { updateWorkMetadata } from "../actions";
import { DeleteWorkSection } from "@/components/works/delete-work-section";
import { StudentWorkFilesPanel } from "@/components/works/student-work-files-panel";
import { getSessionProfile } from "@/lib/auth/session";
import { isStudentSession } from "@/lib/auth/role-guards";
import { worksRepository, workFilesRepository } from "@/repositories";
import type { Work } from "@/types/domain";

export default async function StudentWorkDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ workId: string }>;
  searchParams: Promise<{
    saved?: string;
    error?: string;
    message?: string;
  }>;
}) {
  const { workId } = await params;
  const sp = await searchParams;
  const session = await getSessionProfile();
  if (!isStudentSession(session)) {
    notFound();
  }

  const { work, error } = await worksRepository.getOwnedWorkById({
    ownerId: session.userId,
    workId,
  });

  if (error || !work) {
    notFound();
  }

  const { files, error: filesError } =
    await workFilesRepository.listFilesForWork(workId);

  const w = work as Work & { cover_series_id?: string | null };

  let errorDetail = "";
  if (sp.message) {
    try {
      errorDetail = decodeURIComponent(sp.message).slice(0, 200);
    } catch {
      errorDetail = sp.message.slice(0, 200);
    }
  }

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
      {sp.error === "delete" ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          작품 레코드 삭제에 실패했습니다.
          {errorDetail ? ` (${errorDetail})` : " 잠시 후 다시 시도해 주세요."}
        </p>
      ) : null}
      {sp.error === "delete_storage" ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Storage 파일 삭제에 실패해 작품은 그대로 두었습니다.
          {errorDetail ? ` (${errorDetail})` : " 네트워크·권한을 확인한 뒤 다시 시도해 주세요."}
        </p>
      ) : null}
      {sp.error === "delete_list" ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          파일 목록을 불러오지 못해 삭제를 중단했습니다. (DB·RLS·네트워크를 확인해 주세요)
          {errorDetail ? ` (${errorDetail})` : ""}
        </p>
      ) : null}
      {filesError ? (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          첨부 파일 목록을 불러오지 못했습니다. 새로고침하거나 잠시 후 다시 시도해 주세요. (
          {filesError})
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
          initialCoverSeriesId={w.cover_series_id ?? null}
          files={filesError ? [] : files}
        />
      </div>

      <DeleteWorkSection workId={w.id} workTitle={w.title} />
    </div>
  );
}
