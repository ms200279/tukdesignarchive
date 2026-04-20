export type WorkStatusTone = "neutral" | "warning" | "success";

type WorkStatus = {
  label: string;
  tone: WorkStatusTone;
};

const DEFAULT_TITLES = new Set(["새 작품", "제목 없음"]);

export function deriveWorkStatus(row: {
  title: string;
  description: string | null;
  exhibition_year: number | null;
  fileCount: number;
}): WorkStatus {
  const { title, description, exhibition_year, fileCount } = row;
  const hasDesc = Boolean(description?.trim());
  const hasYear = exhibition_year != null;
  const isDefaultTitle = DEFAULT_TITLES.has(title);

  if (fileCount === 0 && isDefaultTitle) {
    return { label: "초안", tone: "neutral" };
  }

  if (fileCount > 0 && hasDesc && hasYear) {
    return { label: "제출 준비", tone: "success" };
  }

  return { label: "작성 중", tone: "warning" };
}
