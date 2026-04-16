import { createBrowserClient } from "@supabase/ssr";
import { requirePublicSupabaseClientConfig } from "@/config";

/** Browser Supabase client (session + RLS). Implementation detail for SSR auth. */
export function createBrowserSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = requirePublicSupabaseClientConfig();
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
