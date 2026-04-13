export const WORK_FILES_BUCKET = "work-originals";

export function studentEmailDomain() {
  return (
    process.env.NEXT_PUBLIC_STUDENT_EMAIL_DOMAIN ?? "student.tuk-archive.local"
  );
}

export function professorEmailDomain() {
  return process.env.NEXT_PUBLIC_PROFESSOR_EMAIL_DOMAIN ?? "tukorea.ac.kr";
}
