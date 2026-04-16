"use server";

import { credentialsAuth } from "@/lib/auth/auth-instances";
import { redirect } from "next/navigation";

export async function loginAsProfessor(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email) {
    redirect("/login/professor?error=invalid");
  }

  const result = await credentialsAuth.signInWithPassword({ email, password });

  if (!result.ok) {
    redirect("/login/professor?error=credentials");
  }

  redirect("/professor");
}
