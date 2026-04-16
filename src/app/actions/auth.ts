"use server";

import { credentialsAuth } from "@/lib/auth/auth-instances";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signOut() {
  await credentialsAuth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
