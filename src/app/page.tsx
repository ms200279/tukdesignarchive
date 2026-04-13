import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";

export default async function HomePage() {
  const session = await getSessionProfile();
  if (session?.profile.role === "student") {
    redirect("/student");
  }
  if (session?.profile.role === "professor") {
    redirect("/professor");
  }

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
        <p className="mt-8 text-center text-xs text-slate-500">
          Supabase에 마이그레이션을 적용하고 환경 변수를 설정한 뒤 사용하세요.
        </p>
      </div>
    </div>
  );
}
