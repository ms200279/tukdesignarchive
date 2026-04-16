import Link from "next/link";
import * as workRepo from "@/repositories/work.repository";
import type { Work } from "@/types/domain";

type Row = Pick<
  Work,
  "id" | "title" | "exhibition_year" | "updated_at"
> & {
  owner: { display_name: string | null; student_id: string | null } | null;
};

export default async function ProfessorDashboardPage() {
  const { rows, error } = await workRepo.listWorksForProfessor();

  const works = rows as unknown as Row[];

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">전체 작품</h1>
        <p className="text-sm text-slate-600">
          학생이 제출한 메타데이터와 원본 파일을 열람할 수 있습니다.
        </p>
      </div>

      {error ? (
        <p className="mt-6 text-sm text-red-600" role="alert">
          목록을 불러오지 못했습니다. 조인 관계 이름(FK)과 RLS를 확인해 주세요.
        </p>
      ) : null}

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
    </div>
  );
}
