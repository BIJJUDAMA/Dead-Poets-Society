import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your actual Supabase project URL and Anon Key
// You should store these in environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// It's recommended to create a .env.local file in your project root:
/*
NEXT_PUBLIC_SUPABASE_URL="Supabase URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="Supabase Anon Key"
NEXT_PUBLIC_ADMIN_EMAIL="Admin Email"
*/
