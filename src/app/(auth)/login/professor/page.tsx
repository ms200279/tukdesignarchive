import Link from "next/link";
import { loginAsProfessor } from "./actions";

export default async function ProfessorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const sp = await searchParams;
  const registered = sp.registered === "1";
  const err =
    sp.error === "credentials"
      ? "이메일 또는 비밀번호가 올바르지 않습니다."
      : sp.error === "invalid"
        ? "이메일을 입력해 주세요."
        : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        교수 로그인
      </div>
      <h1 className="mt-2 text-xl font-semibold text-slate-900">검토 · 열람</h1>
      <p className="mt-1 text-sm text-slate-600">
        모든 학생 작품 메타데이터와 원본 파일을 열람할 수 있습니다.
      </p>

      {err ? (
        <p
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {err}
        </p>
      ) : null}
      {registered ? (
        <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          교수 계정이 생성되었습니다. 로그인해 주세요.
        </p>
      ) : null}

      <form action={loginAsProfessor} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
            placeholder="professor@tuk.edu"
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
        학생이신가요?{" "}
        <Link href="/login/student" className="font-medium text-slate-900 underline">
          학생 로그인
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-slate-600">
        교수 계정이 없나요?{" "}
        <Link href="/signup/professor" className="font-medium text-slate-900 underline">
          교수 회원가입
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
