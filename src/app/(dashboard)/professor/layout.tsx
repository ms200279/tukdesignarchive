import { redirect } from "next/navigation";
import { getAuthIdentity, isProfessorIdentity } from "@/lib/auth/session";

export default async function ProfessorSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await getAuthIdentity();
  if (!identity) {
    redirect("/");
  }
  if (!isProfessorIdentity(identity)) {
    redirect("/student");
  }
  return children;
}
