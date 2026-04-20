import { StudentWorkFilesPanel } from "@/components/works/student-work-files-panel";
import type { WorkFile } from "@/types/domain";

type FilesResult = { files: WorkFile[]; error: string | null };

/**
 * Server wrapper that awaits an in-flight files fetch and renders the
 * client-side `StudentWorkFilesPanel` (which handles upload / version UI).
 *
 * The parent page starts `listFilesForWork(workId)` eagerly and passes the
 * pending promise here so the edit form (which only needs `work`) can
 * render above-the-fold without waiting on files.
 */
export async function StudentWorkFilesSection({
  filesPromise,
  workId,
  initialCoverSeriesId,
}: {
  filesPromise: Promise<FilesResult>;
  workId: string;
  initialCoverSeriesId: string | null;
}) {
  const { files, error } = await filesPromise;

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          첨부 파일 목록을 불러오지 못했습니다. 새로고침하거나 잠시 후 다시
          시도해 주세요. ({error})
        </p>
      ) : null}
      <StudentWorkFilesPanel
        workId={workId}
        initialCoverSeriesId={initialCoverSeriesId}
        files={error ? [] : files}
      />
    </div>
  );
}

export function StudentWorkFilesSectionSkeleton() {
  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-8 w-28 animate-pulse rounded-md bg-slate-200" />
        </div>
        <div className="mt-4 h-40 w-full max-w-md animate-pulse rounded-md bg-slate-100" />
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-8 w-32 animate-pulse rounded-md bg-slate-800/30" />
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-12 animate-pulse rounded-md bg-slate-100" />
          <div className="h-12 animate-pulse rounded-md bg-slate-100" />
        </div>
      </section>
    </div>
  );
}
