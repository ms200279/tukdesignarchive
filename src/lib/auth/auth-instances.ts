import { SupabaseCredentialsAuthAdapter } from "@/lib/auth/adapters/supabase-credentials-auth.adapter";
import type { CredentialsAuthPort } from "@/lib/auth/ports/credentials-auth.port";

/** Server-only auth port binding (swap adapter for migration). */
export const credentialsAuth: CredentialsAuthPort =
  new SupabaseCredentialsAuthAdapter();
