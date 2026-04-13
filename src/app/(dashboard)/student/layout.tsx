import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";

export default async function StudentSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionProfile();
  if (!session) {
    redirect("/");
  }
  if (session.profile.role !== "student") {
    redirect("/professor");
  }
  return children;
}
