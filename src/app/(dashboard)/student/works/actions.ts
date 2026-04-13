"use server";

import { WORK_FILES_BUCKET } from "@/lib/constants";
import { getSessionProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createWork() {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "student") {
    redirect("/login/student");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("works")
    .insert({
      owner_id: session.userId,
      title: "새 작품",
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect("/student?error=create");
  }

  revalidatePath("/student");
  redirect(`/student/works/${data.id}`);
}

export async function updateWorkMetadata(formData: FormData) {
  const workId = String(formData.get("workId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const yearRaw = String(formData.get("exhibition_year") ?? "").trim();

  const session = await getSessionProfile();
  if (!session || session.profile.role !== "student" || !workId) {
    redirect("/student");
  }

  const exhibition_year = yearRaw ? Number.parseInt(yearRaw, 10) : null;
  const supabase = await createClient();

  const { error } = await supabase
    .from("works")
    .update({
      title: title || "제목 없음",
      description: description || null,
      exhibition_year:
        exhibition_year !== null && !Number.isNaN(exhibition_year)
          ? exhibition_year
          : null,
    })
    .eq("id", workId)
    .eq("owner_id", session.userId);

  if (error) {
    redirect(`/student/works/${workId}?error=save`);
  }

  revalidatePath("/student");
  revalidatePath(`/student/works/${workId}`);
  redirect(`/student/works/${workId}?saved=1`);
}

export async function deleteWorkFile(formData: FormData) {
  const fileId = String(formData.get("fileId") ?? "");
  const workId = String(formData.get("workId") ?? "");

  const session = await getSessionProfile();
  if (!session || session.profile.role !== "student" || !fileId || !workId) {
    redirect("/student");
  }

  const supabase = await createClient();
  const { data: row, error: fetchError } = await supabase
    .from("work_files")
    .select("storage_path")
    .eq("id", fileId)
    .eq("work_id", workId)
    .maybeSingle();

  if (fetchError || !row) {
    redirect(`/student/works/${workId}?error=file`);
  }

  await supabase.storage.from(WORK_FILES_BUCKET).remove([row.storage_path]);
  await supabase.from("work_files").delete().eq("id", fileId);

  revalidatePath(`/student/works/${workId}`);
  redirect(`/student/works/${workId}`);
}
