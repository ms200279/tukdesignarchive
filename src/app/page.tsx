import Link from "next/link";

/**
 * Public landing page.
 *
 * This page is statically prerendered at build time — it must not read
 * `cookies()`, `headers()`, `searchParams`, or any request-time data.
 *
 * Role-based redirection for authenticated visitors is performed by the
 * middleware (`src/lib/db/update-session.ts`) so that the HTML produced
 * here can be served straight from the edge CDN to anonymous users.
 */
export const dynamic = "force-static";
export const revalidate = false;

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 py-24">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          TUK Design
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          졸업전시 아카이브
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          작품 메타데이터와 원본 파일을 분리해 보관하고, 학생은 본인 작품만,
          교수는 전체 작품을 열람할 수 있습니다.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/login/student"
            className="flex items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white hover:bg-slate-800"
          >
            학생 로그인
          </Link>
          <Link
            href="/login/professor"
            className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            교수 로그인
          </Link>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Link
            href="/signup/student"
            className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            학생 회원가입
          </Link>
          <Link
            href="/signup/professor"
            className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            교수 회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
