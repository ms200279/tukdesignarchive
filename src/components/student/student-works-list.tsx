import Link from "next/link";
import { WorkStatusBadge } from "@/components/student/work-status-badge";
import { getAuthIdentity } from "@/lib/auth/session";
import { deriveWorkStatus } from "@/lib/student/work-status";
import { worksRepository, workFilesRepository } from "@/repositories";
import type { StudentWorkListItem } from "@/types/domain";

function formatUpdatedAt(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Server Component: renders the student's works table (desktop) and card list
 * (mobile).
 *
 * Fetch graph:
 *   1. `listWorksForOwner(userId)`        ← 1 RTT
 *   2. `countLatestFilesByWorkIds(ids)`   ← truly dependent on (1)
 *
 * The two calls stay sequential because step 2 needs the ids emitted by step
 * 1. Collapsing these into a single SQL query (view / RPC / denormalized
 * counter) is the only way to remove that RTT and is tracked as a follow-up.
 *
 * Wrapped in `<Suspense>` by the page so this chain does not block siblings.
 */
export async function StudentWorksList() {
  const identity = await getAuthIdentity();
  if (!identity) return null;

  const { rows, error: listError } = await worksRepository.listWorksForOwner(
    identity.userId,
  );
  const works: StudentWorkListItem[] = rows;
  const workIds = works.map((w) => w.id);
  const fileCountMap =
    await workFilesRepository.countLatestFilesByWorkIds(workIds);

  if (listError) {
    return (
      <p className="text-sm text-red-600" role="alert">
        목록을 불러오지 못했습니다. Supabase 연결과 RLS를 확인해 주세요.
      </p>
    );
  }

  return (
    <>
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
                  <WorkStatusBadge label={status.label} tone={status.tone} />
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
    </>
  );
}

export function StudentWorksListSkeleton() {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white md:block">
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="h-3 w-40 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="divide-y divide-slate-200">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4">
              <div className="h-4 flex-1 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-10 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
      <ul className="space-y-3 md:hidden">
        {Array.from({ length: 2 }).map((_, i) => (
          <li
            key={i}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
