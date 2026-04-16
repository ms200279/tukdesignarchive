import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { profileHasRole } from "@/lib/auth/role-guards";
import type { Profile } from "@/types/domain";

const navStudent = [
  { href: "/student", label: "내 작품" },
  { href: "/student/works/new", label: "새 작품" },
];

const navProfessor = [{ href: "/professor", label: "전체 작품" }];

export function DashboardShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const nav = profileHasRole(profile, "student") ? navStudent : navProfessor;
  const badge = profileHasRole(profile, "student")
    ? `학생 · ${profile.student_id ?? "학번 미등록"}`
    : "교수";

  return (
    <div className="flex min-h-full bg-slate-50 text-slate-900">
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
        <div className="border-b border-slate-200 px-4 py-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            TUK Design
          </div>
          <div className="mt-1 text-sm font-semibold">졸업전시 아카이브</div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <div className="font-medium text-slate-800">
              {profile.display_name ?? "이름 없음"}
            </div>
            <div className="mt-0.5 text-slate-500">{badge}</div>
          </div>
          <form action={signOut} className="mt-2">
            <button
              type="submit"
              className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100"
            >
              로그아웃
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold">졸업전시 아카이브</div>
            <form action={signOut}>
              <button type="submit" className="text-sm text-slate-600">
                나가기
              </button>
            </form>
          </div>
          <nav className="mt-3 flex flex-wrap gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <header className="hidden border-b border-slate-200 bg-white px-8 py-4 md:block">
          <div className="text-xs font-medium text-slate-500">관리 화면</div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
