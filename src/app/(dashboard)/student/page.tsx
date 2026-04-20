import Link from "next/link";
import { Suspense } from "react";
import {
  StudentIdentityPanel,
  StudentIdentityPanelSkeleton,
} from "@/components/student/student-identity-panel";
import {
  StudentWorksList,
  StudentWorksListSkeleton,
} from "@/components/student/student-works-list";

/**
 * `/student` dashboard.
 *
 * This page is intentionally a thin shell: only `searchParams` is awaited
 * here so the header, CTA and status banners can render immediately. All
 * data fetches live inside two independent `<Suspense>` widgets:
 *
 *   - `StudentIdentityPanel` → identity (cache hit) + registry id (1 RTT)
 *   - `StudentWorksList`     → works (1 RTT) → file counts (1 RTT, dependent)
 *
 * Both widgets are siblings, so React kicks off their async work in parallel
 * and streams each one in as soon as it finishes. The internal
 * `works → fileCounts` waterfall inside `StudentWorksList` is real (file
 * counts need the ids from works); collapsing that into a single SQL query
 * is tracked as a follow-up.
 */
export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Suspense fallback={<StudentIdentityPanelSkeleton />}>
        <StudentIdentityPanel />
      </Suspense>

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

      {sp.deleted === "1" ? (
        <p
          className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          role="status"
        >
          작품이 삭제되었습니다.
        </p>
      ) : null}
      {sp.error === "delete" ? (
        <p
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          작품을 삭제하지 못했습니다. 다시 로그인한 뒤 시도해 주세요.
        </p>
      ) : null}

      <Suspense fallback={<StudentWorksListSkeleton />}>
        <StudentWorksList />
      </Suspense>
    </div>
  );
}
