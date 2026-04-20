import { redirect } from "next/navigation";
import { getAuthIdentity, isStudentIdentity } from "@/lib/auth/session";

export default async function StudentSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await getAuthIdentity();
  if (!identity) {
    redirect("/");
  }
  if (!isStudentIdentity(identity)) {
    redirect("/professor");
  }
  return children;
}
