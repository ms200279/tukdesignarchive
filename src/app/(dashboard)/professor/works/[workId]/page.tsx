import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkFileDownload } from "@/components/works/work-file-download";
import type { Work, WorkFile } from "@/types/database";

type WorkRow = Work & {
  owner: { display_name: string | null; student_id: string | null } | null;
};

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

  const files = (fileRows ?? []) as WorkFile[];
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

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-900">원본 파일</h2>
        <div className="mt-3 space-y-2">
          {files.length === 0 ? (
            <p className="text-sm text-slate-500">첨부된 파일이 없습니다.</p>
          ) : (
            files.map((f) => <WorkFileDownload key={f.id} file={f} />)
          )}
        </div>
      </div>
    </div>
  );
}
