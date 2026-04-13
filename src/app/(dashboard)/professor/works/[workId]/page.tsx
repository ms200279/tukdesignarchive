import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkFileDownload } from "@/components/works/work-file-download";
import { normalizeWorkFileRow } from "@/lib/work-files-normalize";
import { createClient } from "@/lib/supabase/server";
import type { Work, WorkFile } from "@/types/database";

type WorkRow = Work & {
  owner: { display_name: string | null; student_id: string | null } | null;
};

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

export default async function ProfessorWorkDetailPage({
  params,
}: {
  params: Promise<{ workId: string }>;
}) {
  const { workId } = await params;
  const supabase = await createClient();

  const { data: work, error } = await supabase
    .from("works")
    .select(
      "*, owner:profiles!works_owner_id_fkey(display_name, student_id)",
    )
    .eq("id", workId)
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
  );
  const groups = groupBySeries(files);
  const coverGroups = groups.filter((g) => g.kind === "cover");
  const originalGroups = groups.filter((g) => g.kind === "original");

  const w = work as unknown as WorkRow;

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

      <div className="mt-8 space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-slate-900">대표 이미지</h2>
          <div className="mt-3 space-y-3">
            {coverGroups.length === 0 ? (
              <p className="text-sm text-slate-500">등록된 대표 이미지가 없습니다.</p>
            ) : (
              coverGroups.map((g) => (
                <div
                  key={g.seriesId}
                  className="rounded-lg border border-slate-200 bg-white p-3"
                >
                  <p className="mb-2 text-xs text-slate-500">시리즈 (버전 {g.versions.length})</p>
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
    </div>
  );
}
