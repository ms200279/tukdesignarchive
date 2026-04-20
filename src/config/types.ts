/**
 * Typed slices of configuration (no process.env here).
 * Populated by `public.ts` reader.
 */

/** Supabase-compatible public client credentials (safe to expose to the browser bundle). */
export type PublicSupabaseClientConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};
