import { studentEmailDomain } from "@/lib/constants";

/** Supabase Auth는 이메일 형식이 필요하므로 학번을 내부 도메인 이메일로 매핑합니다. */
export function studentAuthEmail(studentId: string) {
  const normalized = studentId.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!normalized) {
    throw new Error("학번을 입력해 주세요.");
  }
  return `${normalized}@${studentEmailDomain()}`;
}
