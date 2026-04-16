import { professorEmailDomain } from "@/config";

export function normalizeProfessorEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidProfessorSchoolEmail(email: string) {
  const normalized = normalizeProfessorEmail(email);
  const domain = professorEmailDomain().trim().toLowerCase();
  if (!normalized || !domain) return false;
  return normalized.endsWith(`@${domain}`);
}
