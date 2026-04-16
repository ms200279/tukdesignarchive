import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";
import { isStudentSession } from "@/lib/auth/role-guards";

export default async function StudentSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionProfile();
  if (!session) {
    redirect("/");
  }
  if (!isStudentSession(session)) {
    redirect("/professor");
  }
  return children;
}
