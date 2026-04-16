"use client";

import { deleteWork } from "@/app/(dashboard)/student/works/actions";

export function DeleteWorkSection({
  workId,
  workTitle,
}: {
  workId: string;
  workTitle: string;
}) {
  return (
    <section className="mt-10 rounded-lg border border-red-200 bg-red-50/40 p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-red-900">작품 삭제</h2>
      <p className="mt-1 text-xs text-red-800/90">
        &quot;{workTitle}&quot; 작품과 연결된 모든 파일 메타데이터·Storage
        원본이 함께 삭제됩니다. 되돌릴 수 없습니다.
      </p>
      <form
        className="mt-4"
        action={deleteWork}
        onSubmit={(e) => {
          const ok = window.confirm(
            `작품 "${workTitle}"을(를) 완전히 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`,
          );
          if (!ok) e.preventDefault();
        }}
      >
        <input type="hidden" name="workId" value={workId} />
        <button
          type="submit"
          className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-50"
        >
          작품 삭제
        </button>
      </form>
    </section>
  );
}
