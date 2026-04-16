import Link from "next/link";
import { WorkStatusBadge } from "@/components/student/work-status-badge";
import { getSessionProfile } from "@/lib/auth/session";
import { deriveWorkStatus } from "@/lib/student/work-status";
import * as workFileRepo from "@/repositories/work-file.repository";
import * as workRepo from "@/repositories/work.repository";
import * as studentRegistryRepo from "@/repositories/student-registry.repository";

type WorkRow = {
  id: string;
  title: string;
  description: string | null;
  exhibition_year: number | null;
  updated_at: string;
};

function formatUpdatedAt(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function StudentDashboardPage() {
  const session = await getSessionProfile();
  const studentRegistryId = session
    ? await studentRegistryRepo.findRegistryIdByProfileId(session.userId)
    : null;

  const { rows, error: listError } = session
    ? await workRepo.listWorksForOwner(session.userId)
    : { rows: [], error: null };

  const works = rows as WorkRow[];
  const workIds = works.map((w) => w.id);
  const fileCountMap = await workFileRepo.countLatestFilesByWorkIds(workIds);
  const error = listError;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          로그인 정보
        </p>
        {session ? (
          <dl className="mt-3 grid gap-3 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-slate-500">이름</dt>
              <dd className="text-sm font-medium text-slate-900">
                {session.profile.display_name ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">학번</dt>
              <dd className="text-sm font-medium text-slate-900">
                {session.profile.student_id ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">역할</dt>
              <dd className="text-sm font-medium text-slate-900">학생</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">학생 ID</dt>
              <dd className="text-sm font-medium text-slate-900">
                {studentRegistryId ?? "—"}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 text-sm text-slate-600">세션을 불러올 수 없습니다.</p>
        )}
      </section>

      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            내 작품
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            작품을 등록하고 메타데이터·원본 파일을 관리합니다.
          </p>
        </div>
        <Link
          href="/student/works/new"
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-slate-900 bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
        >
          작품 등록
        </Link>
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          목록을 불러오지 못했습니다. Supabase 연결과 RLS를 확인해 주세요.
        </p>
      ) : null}

      {/* 데스크톱: 테이블 */}
      <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-white">
            <tr className="text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">제목</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">연도</th>
              <th className="px-4 py-3 font-medium">최근 수정</th>
              <th className="px-4 py-3 text-right font-medium">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {works.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-slate-500"
                >
                  등록된 작품이 없습니다. 상단의 &quot;작품 등록&quot;으로
                  시작하세요.
                </td>
              </tr>
            ) : (
              works.map((w) => {
                const fc = fileCountMap[w.id] ?? 0;
                const status = deriveWorkStatus({
                  title: w.title,
                  description: w.description,
                  exhibition_year: w.exhibition_year,
                  fileCount: fc,
                });
                return (
                  <tr key={w.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {w.title}
                    </td>
                    <td className="px-4 py-3">
                      <WorkStatusBadge
                        label={status.label}
                        tone={status.tone}
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {w.exhibition_year ?? "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-600">
                      {formatUpdatedAt(w.updated_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/student/works/${w.id}`}
                        className="text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-900"
                      >
                        편집
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 모바일: 카드 */}
      <ul className="space-y-3 md:hidden">
        {works.length === 0 ? (
          <li className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
            등록된 작품이 없습니다. &quot;작품 등록&quot;으로 시작하세요.
          </li>
        ) : (
          works.map((w) => {
            const fc = fileCountMap[w.id] ?? 0;
            const status = deriveWorkStatus({
              title: w.title,
              description: w.description,
              exhibition_year: w.exhibition_year,
              fileCount: fc,
            });
            return (
              <li
                key={w.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    {w.title}
                  </h2>
                  <WorkStatusBadge
                    label={status.label}
                    tone={status.tone}
                  />
                </div>
                <dl className="mt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between gap-2 border-t border-slate-100 pt-2">
                    <dt>전시 연도</dt>
                    <dd className="font-medium text-slate-800">
                      {w.exhibition_year ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>최근 수정</dt>
                    <dd className="tabular-nums text-slate-800">
                      {formatUpdatedAt(w.updated_at)}
                    </dd>
                  </div>
                </dl>
                <Link
                  href={`/student/works/${w.id}`}
                  className="mt-3 inline-flex text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-2"
                >
                  편집하기
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
