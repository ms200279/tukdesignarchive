import "server-only";

/**
 * Server-only secrets and URLs. Never import from Client Components.
 * (Next still bundles carefully — `server-only` throws if this file is imported on client.)
 */

export type ServerDatabasePushConfig = {
  /** Full Postgres URL (optional if password + public URL used by scripts). */
  databaseUrl?: string;
  databasePassword?: string;
};

export function getSupabaseDbUrl(): string | undefined {
  const v = process.env.SUPABASE_DB_URL?.trim();
  return v && v.length > 0 ? v : undefined;
}

export function getSupabaseDbPassword(): string | undefined {
  const v = process.env.SUPABASE_DB_PASSWORD?.trim();
  return v && v.length > 0 ? v : undefined;
}

export function getServerDatabasePushConfig(): ServerDatabasePushConfig {
  return {
    databaseUrl: getSupabaseDbUrl(),
    databasePassword: getSupabaseDbPassword(),
  };
}
