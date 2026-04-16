import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";
import { isProfessorSession } from "@/lib/auth/role-guards";

export default async function ProfessorSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionProfile();
  if (!session) {
    redirect("/");
  }
  if (!isProfessorSession(session)) {
    redirect("/student");
  }
  return children;
}
