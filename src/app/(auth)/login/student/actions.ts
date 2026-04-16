"use server";

import { credentialsAuth } from "@/lib/auth/auth-instances";
import { studentAuthEmail } from "@/lib/auth/student-email";
import { redirect } from "next/navigation";

export async function loginAsStudent(formData: FormData) {
  const rawId = String(formData.get("studentId") ?? "");
  const password = String(formData.get("password") ?? "");

  let email: string;
  try {
    email = studentAuthEmail(rawId);
  } catch {
    redirect("/login/student?error=invalid");
  }

  const result = await credentialsAuth.signInWithPassword({ email, password });

  if (!result.ok) {
    redirect("/login/student?error=credentials");
  }

  redirect("/student");
}
