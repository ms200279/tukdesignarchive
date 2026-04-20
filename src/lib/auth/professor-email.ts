import { professorEmailDomains } from "@/config";

export function normalizeProfessorEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidProfessorSchoolEmail(email: string) {
  const normalized = normalizeProfessorEmail(email);
  if (!normalized) return false;
  const domains = professorEmailDomains();
  if (domains.length === 0) return false;
  return domains.some((d) => normalized.endsWith(`@${d}`));
}
