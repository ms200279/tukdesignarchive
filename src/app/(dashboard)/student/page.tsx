import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Work } from "@/types/database";

export default async function StudentDashboardPage() {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("works")
    .select("id, title, exhibition_year, updated_at")
    .order("updated_at", { ascending: false });

  const works = (rows ?? []) as Pick<
    Work,
    "id" | "title" | "exhibition_year" | "updated_at"
  >[];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">내 작품</h1>
          <p className="text-sm text-slate-600">
            작품 메타데이터를 수정하고 원본 파일을 업로드합니다.
          </p>
        </div>
        <Link
          href="/student/works/new"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          새 작품
        </Link>
      </div>

      {error ? (
        <p className="mt-6 text-sm text-red-600" role="alert">
          목록을 불러오지 못했습니다. Supabase 환경 변수와 RLS를 확인해 주세요.
        </p>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3">연도</th>
              <th className="px-4 py-3">수정</th>
              <th className="px-4 py-3 text-right">열기</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {works.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  아직 등록된 작품이 없습니다. &quot;새 작품&quot;으로 시작해 보세요.
                </td>
              </tr>
            ) : (
              works.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {w.title}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {w.exhibition_year ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(w.updated_at).toLocaleString("ko-KR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/student/works/${w.id}`}
                      className="text-sm font-medium text-slate-900 underline"
                    >
                      편집
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
