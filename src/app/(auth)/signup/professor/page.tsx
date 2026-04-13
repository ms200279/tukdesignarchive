import Link from "next/link";
import { professorEmailDomain } from "@/lib/constants";
import { signUpAsProfessor } from "./actions";

export default async function ProfessorSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const domain = professorEmailDomain();
  const err =
    sp.error === "email"
      ? `학교 이메일(@${domain})만 가입할 수 있습니다.`
      : sp.error === "name"
        ? "이름을 입력해 주세요."
        : sp.error === "password"
          ? "비밀번호는 8자 이상이어야 합니다."
          : sp.error === "password_confirm"
            ? "비밀번호 확인이 일치하지 않습니다."
            : sp.error === "exists"
              ? "이미 가입된 이메일입니다."
              : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        교수 회원가입
      </div>
      <h1 className="mt-2 text-xl font-semibold text-slate-900">계정 생성</h1>
      <p className="mt-1 text-sm text-slate-600">
        학교 이메일(@{domain})로 교수 계정을 생성합니다.
      </p>

      {err ? (
        <p
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {err}
        </p>
      ) : null}

      <form action={signUpAsProfessor} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            학교 이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
            placeholder={`name@${domain}`}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="displayName" className="text-sm font-medium text-slate-700">
            이름
          </label>
          <input
            id="displayName"
            name="displayName"
            required
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
            placeholder="교수 이름"
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
            autoComplete="new-password"
            minLength={8}
            required
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="passwordConfirm"
            className="text-sm font-medium text-slate-700"
          >
            비밀번호 확인
          </label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
          />
        </div>
        <button
          type="submit"
          className="mt-2 rounded-md bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          회원가입
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        이미 계정이 있나요?{" "}
        <Link href="/login/professor" className="font-medium text-slate-900 underline">
          교수 로그인
        </Link>
      </p>
    </div>
  );
}
