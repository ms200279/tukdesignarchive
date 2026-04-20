import { getAuthIdentity } from "@/lib/auth/session";
import { usersRepository } from "@/repositories";

/**
 * Server Component: renders the student login-info card.
 *
 * Data sources:
 *   - `identity` comes from `getAuthIdentity()` which is React-cached, so the
 *     first call (in the layout) is the only one that actually verifies the
 *     JWT — subsequent calls in widgets are in-memory hits.
 *   - `studentRegistryId` is the only real I/O this widget performs.
 *
 * Isolated behind a `<Suspense>` boundary so its DB roundtrip does not block
 * the works table (or vice-versa). The layout guarantees a non-null identity
 * by redirecting unauthenticated users away before this widget renders.
 */
export async function StudentIdentityPanel() {
  const identity = await getAuthIdentity();
  if (!identity) return null;

  const studentRegistryId =
    await usersRepository.findStudentRegistryIdByProfileId(identity.userId);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        로그인 정보
      </p>
      <dl className="mt-3 grid gap-3 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-slate-500">이름</dt>
          <dd className="text-sm font-medium text-slate-900">
            {identity.display_name ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">학번</dt>
          <dd className="text-sm font-medium text-slate-900">
            {identity.student_id ?? "—"}
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
    </section>
  );
}

export function StudentIdentityPanelSkeleton() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-12 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </section>
  );
}
