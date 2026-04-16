import { studentEmailDomain } from "@/config/env";

/** Supabase Auth는 이메일 형식이 필요하므로 학번을 내부 도메인 이메일로 매핑합니다. */
export function studentAuthEmail(studentId: string) {
  const normalized = normalizeStudentId(studentId);
  if (!normalized) {
    throw new Error("학번을 입력해 주세요.");
  }
  return `${normalized}@${studentEmailDomain()}`;
}

export function normalizeStudentId(studentId: string) {
  return studentId.trim().replace(/\s+/g, "");
}

export function isValidStudentId(studentId: string) {
  return /^\d{10}$/.test(normalizeStudentId(studentId));
}
