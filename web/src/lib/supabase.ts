import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client-side Supabase (uses anon key, respects RLS)
export function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Server-side Supabase (uses service role, bypasses RLS)
export function getSupabaseAdmin() {
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Types
export interface Meeting {
  id: string;
  user_id: string;
  title: string | null;
  raw_notes: string;
  created_at: string;
}

export interface ActionItem {
  id: string;
  meeting_id: string;
  assignees: string[];
  task: string;
  due_type: string | null;
  due_raw: string | null;
  due_resolved: string | null;
  priority: "high" | "normal" | "low";
  status: string;
  confidence: number;
  source: {
    speaker: string;
    quote_context: string;
  } | null;
  extracted_at: string;
}

export interface RoughNote {
  id: string;
  meeting_id: string;
  note: string;
  source: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  api_key: string | null;
  created_at: string;
  updated_at: string;
}
