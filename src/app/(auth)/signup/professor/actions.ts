"use server";

import {
  isValidProfessorSchoolEmail,
  normalizeProfessorEmail,
} from "@/lib/auth/professor-email";
import { signupErrorCode } from "@/lib/auth/signup-error";
import { credentialsAuth } from "@/lib/auth/auth-instances";
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

  const result = await credentialsAuth.signUpWithMetadata({
    email,
    password,
    metadata: {
      role: "professor",
      display_name: displayName,
    },
  });

  if (!result.ok) {
    redirect(`/signup/professor?error=${signupErrorCode(result.error)}`);
  }

  if (result.identitiesCount === 0) {
    redirect("/signup/professor?error=exists");
  }

  redirect("/login/professor?registered=1");
}
