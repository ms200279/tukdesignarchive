"use server";

import { getSessionProfile } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as workRepo from "@/repositories/work.repository";

export async function createWork() {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "student") {
    redirect("/login/student");
  }

  const result = await workRepo.insertWorkForOwner({
    ownerId: session.userId,
    title: "새 작품",
  });

  if ("error" in result) {
    redirect("/student?error=create");
  }

  revalidatePath("/student");
  redirect(`/student/works/${result.id}`);
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
  const { error } = await workRepo.updateWorkMetadataForOwner({
    ownerId: session.userId,
    workId,
    title: title || "제목 없음",
    description: description || null,
    exhibition_year:
      exhibition_year !== null && !Number.isNaN(exhibition_year)
        ? exhibition_year
        : null,
  });

  if (error) {
    redirect(`/student/works/${workId}?error=save`);
  }

  revalidatePath("/student");
  revalidatePath(`/student/works/${workId}`);
  redirect(`/student/works/${workId}?saved=1`);
}
