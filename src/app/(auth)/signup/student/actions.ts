"use server";

import {
  isValidStudentId,
  normalizeStudentId,
  studentAuthEmail,
} from "@/lib/auth/student-email";
import { signupErrorCode } from "@/lib/auth/signup-error";
import { signUpWithEmail } from "@/lib/auth/supabase-server-auth";
import { redirect } from "next/navigation";

export async function signUpAsStudent(formData: FormData) {
  const rawId = String(formData.get("studentId") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  const studentId = normalizeStudentId(rawId);
  if (!isValidStudentId(studentId)) {
    redirect("/signup/student?error=student_id");
  }
  if (!displayName) {
    redirect("/signup/student?error=name");
  }
  if (password.length < 8) {
    redirect("/signup/student?error=password");
  }
  if (password !== passwordConfirm) {
    redirect("/signup/student?error=password_confirm");
  }

  const email = studentAuthEmail(studentId);
  const { data, error } = await signUpWithEmail({
    email,
    password,
    metadata: {
      role: "student",
      student_id: studentId,
      display_name: displayName,
    },
  });

  if (error) {
    redirect(`/signup/student?error=${signupErrorCode(error)}`);
  }

  if (
    data.user &&
    Array.isArray(data.user.identities) &&
    data.user.identities.length === 0
  ) {
    redirect("/signup/student?error=exists");
  }

  redirect("/login/student?registered=1");
}
