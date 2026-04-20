import { WorkFileDownload } from "@/components/works/work-file-download";
import type { WorkFile } from "@/types/domain";

type FilesResult = { files: WorkFile[]; error: string | null };

type SeriesGroup = {
  seriesId: string;
  kind: "cover" | "original";
  versions: WorkFile[];
};

function groupBySeries(files: WorkFile[]): SeriesGroup[] {
  const map = new Map<string, WorkFile[]>();
  for (const f of files) {
    const list = map.get(f.series_id) ?? [];
    list.push(f);
    map.set(f.series_id, list);
  }
  return [...map.entries()].map(([seriesId, versions]) => {
    const sorted = [...versions].sort((a, b) => b.version - a.version);
    const kind = sorted[0]?.kind ?? "original";
    return { seriesId, kind, versions: sorted };
  });
}

/**
 * Server Component that awaits an already-in-flight files fetch.
 *
 * The page kicks off `listFilesForWork(workId)` eagerly (without awaiting)
 * and passes the resulting promise down. This lets the metadata card
 * above-the-fold render as soon as the `work` query resolves, while we
 * stream the cover + original file sections in when `files` is ready.
 */
export async function ProfessorWorkFilesSection({
  filesPromise,
}: {
  filesPromise: Promise<FilesResult>;
}) {
  const { files } = await filesPromise;
  const groups = groupBySeries(files);
  const coverGroups = groups.filter((g) => g.kind === "cover");
  const originalGroups = groups.filter((g) => g.kind === "original");

  return (
    <div className="mt-8 space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-slate-900">대표 이미지</h2>
        <div className="mt-3 space-y-3">
          {coverGroups.length === 0 ? (
            <p className="text-sm text-slate-500">
              등록된 대표 이미지가 없습니다.
            </p>
          ) : (
            coverGroups.map((g) => (
              <div
                key={g.seriesId}
                className="rounded-lg border border-slate-200 bg-white p-3"
              >
                <p className="mb-2 text-xs text-slate-500">
                  시리즈 (버전 {g.versions.length})
                </p>
                <ul className="space-y-2">
                  {g.versions.map((f) => (
                    <li key={f.id}>
                      <WorkFileDownload file={f} />
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-900">원본 파일</h2>
        <div className="mt-3 space-y-3">
          {originalGroups.length === 0 ? (
            <p className="text-sm text-slate-500">원본 파일이 없습니다.</p>
          ) : (
            originalGroups.map((g) => (
              <div
                key={g.seriesId}
                className="rounded-lg border border-slate-200 bg-white p-3"
              >
                <p className="mb-2 text-xs text-slate-500">
                  자산 · 버전 {g.versions.length}
                </p>
                <ul className="space-y-2">
                  {g.versions.map((f) => (
                    <li key={f.id}>
                      <WorkFileDownload file={f} />
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export function ProfessorWorkFilesSectionSkeleton() {
  return (
    <div className="mt-8 space-y-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <section key={i}>
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 space-y-3">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
              <div className="mt-2 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
