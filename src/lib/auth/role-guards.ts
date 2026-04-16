import type { Profile, SessionWithProfile, UserRole } from "@/types/domain";

export function profileHasRole(profile: Profile, role: UserRole): boolean {
  return profile.role === role;
}

export function sessionHasRole<R extends UserRole>(
  session: SessionWithProfile | null,
  role: R,
): session is SessionWithProfile & { profile: Profile & { role: R } } {
  return !!session && session.profile.role === role;
}

export function isStudentSession(
  session: SessionWithProfile | null,
): session is SessionWithProfile & { profile: Profile & { role: "student" } } {
  return sessionHasRole(session, "student");
}

export function isProfessorSession(
  session: SessionWithProfile | null,
): session is SessionWithProfile & { profile: Profile & { role: "professor" } } {
  return sessionHasRole(session, "professor");
}
