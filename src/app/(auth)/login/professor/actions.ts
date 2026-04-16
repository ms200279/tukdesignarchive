"use server";

import { signInWithPassword } from "@/lib/auth/supabase-server-auth";
import { redirect } from "next/navigation";

export async function loginAsProfessor(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email) {
    redirect("/login/professor?error=invalid");
  }

  const { error } = await signInWithPassword({ email, password });

  if (error) {
    redirect("/login/professor?error=credentials");
  }

  redirect("/professor");
}
