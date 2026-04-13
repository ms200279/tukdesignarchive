"use server";

import { studentAuthEmail } from "@/lib/auth/student-email";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login/student?error=credentials");
  }

  redirect("/student");
}
