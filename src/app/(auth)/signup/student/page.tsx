import Link from "next/link";
import { signUpAsStudent } from "./actions";

export default async function StudentSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const err =
    sp.error === "student_id"
      ? "학번은 숫자 10자리로 입력해 주세요."
      : sp.error === "name"
        ? "이름을 입력해 주세요."
        : sp.error === "password"
          ? "비밀번호는 8자 이상이어야 합니다."
          : sp.error === "password_confirm"
            ? "비밀번호 확인이 일치하지 않습니다."
            : sp.error === "exists"
              ? "이미 가입된 학번입니다."
              : sp.error === "password_policy"
                ? "비밀번호 정책에 맞지 않습니다. 더 안전한 비밀번호로 다시 시도해 주세요."
                : sp.error === "server"
                  ? "서버 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
                  : sp.error === "unknown"
                    ? "회원가입 처리 중 알 수 없는 오류가 발생했습니다."
              : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        학생 회원가입
      </div>
      <h1 className="mt-2 text-xl font-semibold text-slate-900">계정 생성</h1>
      <p className="mt-1 text-sm text-slate-600">
        학번(숫자 10자리)으로 학생 계정을 생성합니다. 가입 후 학번별 학생 ID가
        자동 발급됩니다.
      </p>

      {err ? (
        <p
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {err}
        </p>
      ) : null}

      <form action={signUpAsStudent} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="studentId" className="text-sm font-medium text-slate-700">
            학번 (10자리)
          </label>
          <input
            id="studentId"
            name="studentId"
            autoComplete="username"
            required
            maxLength={10}
            pattern="[0-9]{10}"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
            placeholder="2024123456"
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
            placeholder="홍길동"
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
        <Link href="/login/student" className="font-medium text-slate-900 underline">
          학생 로그인
        </Link>
      </p>
    </div>
  );
}
