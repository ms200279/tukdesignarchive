import Link from "next/link";
import { worksRepository } from "@/repositories";
import type { ProfessorWorkListItem } from "@/types/domain";

/**
 * Server Component: professor-facing list of every student work.
 *
 * Owns its own fetch (`listWorksForProfessor` joins `profiles`) so the page
 * shell can render its header immediately while this query streams in
 * behind `<Suspense>`. RLS policies on `works` enforce professor read
 * access; no additional auth guard is needed here.
 */
export async function ProfessorWorksTable() {
  const { rows, error } = await worksRepository.listWorksForProfessor();
  const works: ProfessorWorkListItem[] = rows;

  if (error) {
    return (
      <p className="mt-6 text-sm text-red-600" role="alert">
        목록을 불러오지 못했습니다. 조인 관계 이름(FK)과 RLS를 확인해 주세요.
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">제목</th>
            <th className="px-4 py-3">학생</th>
            <th className="px-4 py-3">학번</th>
            <th className="px-4 py-3">연도</th>
            <th className="px-4 py-3">수정</th>
            <th className="px-4 py-3 text-right">보기</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {works.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                등록된 작품이 없습니다.
              </td>
            </tr>
          ) : (
            works.map((w) => (
              <tr key={w.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {w.title}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {w.owner?.display_name ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {w.owner?.student_id ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {w.exhibition_year ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(w.updated_at).toLocaleString("ko-KR")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/professor/works/${w.id}`}
                    className="text-sm font-medium text-slate-900 underline"
                  >
                    열람
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function ProfessorWorksTableSkeleton() {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="h-3 w-48 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4">
            <div className="h-4 flex-1 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-10 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
