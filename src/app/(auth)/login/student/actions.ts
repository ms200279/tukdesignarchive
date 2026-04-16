"use server";

import { studentAuthEmail } from "@/lib/auth/student-email";
import { signInWithPassword } from "@/lib/auth/supabase-server-auth";
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

  const { error } = await signInWithPassword({ email, password });

  if (error) {
    redirect("/login/student?error=credentials");
  }

  redirect("/student");
}
