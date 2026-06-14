import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Check if credentials are set and are not the placeholder templates
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("your-project") &&
  !supabaseAnonKey.includes("your-anon-key")
);

// Server-side database client: Use service role key to bypass RLS in route handlers.
// Fallback to anon key if service role key is not configured.
const dbKey = supabaseServiceRoleKey && !supabaseServiceRoleKey.includes("your-service-role-key")
  ? supabaseServiceRoleKey
  : supabaseAnonKey;

// Fallback to a placeholder URL if credentials are not configured
// to prevent runtime exceptions during standard Next.js static builds.
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : "https://placeholder-project.supabase.co",
  isSupabaseConfigured ? dbKey : "placeholder-anonymous-key-12345"
);
