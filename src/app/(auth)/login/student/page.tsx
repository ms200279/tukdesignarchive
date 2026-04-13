import Link from "next/link";
import { loginAsStudent } from "./actions";

export default async function StudentLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const err =
    sp.error === "credentials"
      ? "학번 또는 비밀번호가 올바르지 않습니다."
      : sp.error === "invalid"
        ? "학번을 확인해 주세요."
        : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        학생 로그인
      </div>
      <h1 className="mt-2 text-xl font-semibold text-slate-900">아카이브</h1>
      <p className="mt-1 text-sm text-slate-600">
        학번과 비밀번호로 본인 작품을 관리합니다.
      </p>

      {err ? (
        <p
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {err}
        </p>
      ) : null}

      <form action={loginAsStudent} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="studentId" className="text-sm font-medium text-slate-700">
            학번
          </label>
          <input
            id="studentId"
            name="studentId"
            autoComplete="username"
            required
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
            placeholder="2024123456"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
          />
        </div>
        <button
          type="submit"
          className="mt-2 rounded-md bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          로그인
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        교수이신가요?{" "}
        <Link href="/login/professor" className="font-medium text-slate-900 underline">
          교수 로그인
        </Link>
      </p>
      <p className="mt-3 text-center text-sm">
        <Link href="/" className="text-slate-500 hover:text-slate-700">
          처음으로
        </Link>
      </p>
    </div>
  );
}
