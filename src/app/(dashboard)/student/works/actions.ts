"use server";

import { getSessionProfile } from "@/lib/auth/session";
import { isStudentSession } from "@/lib/auth/role-guards";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { workFileStorage } from "@/lib/storage/storage-instances";
import { worksRepository, workFilesRepository } from "@/repositories";

export async function createWork() {
  const session = await getSessionProfile();
  if (!isStudentSession(session)) {
    redirect("/login/student");
  }

  const result = await worksRepository.insertWorkForOwner({
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
  if (!isStudentSession(session) || !workId) {
    redirect("/student");
  }

  const exhibition_year = yearRaw ? Number.parseInt(yearRaw, 10) : null;
  const { error } = await worksRepository.updateWorkMetadataForOwner({
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

export async function deleteWork(formData: FormData) {
  const workId = String(formData.get("workId") ?? "").trim();

  const session = await getSessionProfile();
  if (!isStudentSession(session) || !workId) {
    redirect("/student?error=delete");
  }

  const { work, error: loadErr } = await worksRepository.getOwnedWorkById({
    ownerId: session.userId,
    workId,
  });
  if (loadErr || !work) {
    redirect("/student?error=delete");
  }

  const { refs, error: refsErr } =
    await workFilesRepository.listObjectRefsForWork(workId);
  if (refsErr) {
    redirect(
      `/student/works/${workId}?error=delete_list&message=${encodeURIComponent(refsErr)}`,
    );
  }

  const storageResult = await workFileStorage.deleteObjects(refs);
  if (storageResult.error) {
    redirect(
      `/student/works/${workId}?error=delete_storage&message=${encodeURIComponent(storageResult.error)}`,
    );
  }

  const { error: delErr } = await worksRepository.deleteWorkForOwner({
    ownerId: session.userId,
    workId,
  });
  if (delErr) {
    redirect(
      `/student/works/${workId}?error=delete&message=${encodeURIComponent(delErr)}`,
    );
  }

  revalidatePath("/student");
  revalidatePath(`/student/works/${workId}`);
  redirect("/student?deleted=1");
}
