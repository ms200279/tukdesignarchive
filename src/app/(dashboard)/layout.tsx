import { redirect } from "next/navigation";
import { getAuthIdentity } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await getAuthIdentity();
  if (!identity) {
    redirect("/");
  }

  return <DashboardShell identity={identity}>{children}</DashboardShell>;
}
