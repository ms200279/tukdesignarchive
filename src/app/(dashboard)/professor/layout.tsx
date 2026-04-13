import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";

export default async function ProfessorSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionProfile();
  if (!session) {
    redirect("/");
  }
  if (session.profile.role !== "professor") {
    redirect("/student");
  }
  return children;
}
