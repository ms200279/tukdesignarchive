"use server";

import { signOutEverywhere } from "@/lib/auth/supabase-server-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signOut() {
  await signOutEverywhere();
  revalidatePath("/", "layout");
  redirect("/");
}
