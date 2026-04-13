import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionProfile();
  if (!session) {
    redirect("/");
  }

  return <DashboardShell profile={session.profile}>{children}</DashboardShell>;
}
