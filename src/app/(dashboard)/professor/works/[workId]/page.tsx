import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ProfessorWorkFilesSection,
  ProfessorWorkFilesSectionSkeleton,
} from "@/components/works/professor-work-files-section";
import { worksRepository, workFilesRepository } from "@/repositories";

export default async function ProfessorWorkDetailPage({
  params,
}: {
  params: Promise<{ workId: string }>;
}) {
  const { workId } = await params;

  // Kick off the files fetch eagerly so it overlaps with the work fetch; we
  // pass the pending promise into a Suspense child that awaits it. This
  // keeps total DB time the same as `Promise.all` but lets the metadata
  // card render as soon as `work` resolves, without waiting on `files`.
  const filesPromise = workFilesRepository.listFilesForWork(workId);

  const { work, error } =
    await worksRepository.getWorkByIdForProfessorView(workId);

  if (error || !work) {
    notFound();
  }

  const w = work;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/professor"
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        ← 목록
      </Link>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
          작품 열람
        </div>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">{w.title}</h1>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">학생</dt>
            <dd className="font-medium text-slate-900">
              {w.owner?.display_name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">학번</dt>
            <dd className="font-medium text-slate-900">
              {w.owner?.student_id ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">전시 연도</dt>
            <dd className="font-medium text-slate-900">
              {w.exhibition_year ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">수정 시각</dt>
            <dd className="font-medium text-slate-900">
              {new Date(w.updated_at).toLocaleString("ko-KR")}
            </dd>
          </div>
        </dl>
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-slate-900">설명</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
            {w.description?.trim() ? w.description : "—"}
          </p>
        </div>
      </div>

      <Suspense fallback={<ProfessorWorkFilesSectionSkeleton />}>
        <ProfessorWorkFilesSection filesPromise={filesPromise} />
      </Suspense>
    </div>
  );
}
