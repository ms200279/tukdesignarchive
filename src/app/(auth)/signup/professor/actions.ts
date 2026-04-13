"use server";

import {
  isValidProfessorSchoolEmail,
  normalizeProfessorEmail,
} from "@/lib/auth/professor-email";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUpAsProfessor(formData: FormData) {
  const rawEmail = String(formData.get("email") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  const email = normalizeProfessorEmail(rawEmail);
  if (!isValidProfessorSchoolEmail(email)) {
    redirect("/signup/professor?error=email");
  }
  if (!displayName) {
    redirect("/signup/professor?error=name");
  }
  if (password.length < 8) {
    redirect("/signup/professor?error=password");
  }
  if (password !== passwordConfirm) {
    redirect("/signup/professor?error=password_confirm");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "professor",
        display_name: displayName,
      },
    },
  });

  if (error) {
    redirect("/signup/professor?error=exists");
  }

  redirect("/login/professor?registered=1");
}
