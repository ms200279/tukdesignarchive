type AuthErrLike = {
  message?: string;
  code?: string;
  status?: number;
};

/** Supabase signup 오류를 UI 쿼리 파라미터로 정규화 */
export function signupErrorCode(error: AuthErrLike | null) {
  if (!error) return null;
  const msg = (error.message ?? "").toLowerCase();
  const code = (error.code ?? "").toLowerCase();
  const status = error.status ?? 0;

  if (
    code.includes("user_already") ||
    msg.includes("already registered") ||
    msg.includes("already exists") ||
    status === 422
  ) {
    return "exists";
  }

  if (
    msg.includes("password") ||
    msg.includes("weak") ||
    code.includes("weak_password")
  ) {
    return "password_policy";
  }

  if (status >= 500 || msg.includes("database")) {
    return "server";
  }

  return "unknown";
}
