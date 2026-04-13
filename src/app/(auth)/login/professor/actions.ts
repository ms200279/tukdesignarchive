"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginAsProfessor(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email) {
    redirect("/login/professor?error=invalid");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login/professor?error=credentials");
  }

  redirect("/professor");
}
