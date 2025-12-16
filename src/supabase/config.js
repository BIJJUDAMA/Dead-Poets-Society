/**
 * Initializes the Supabase client for interacting with the backend.
 * 
 * Purpose:
 * - Establishes connection using environment variables.
 * - Provides a singleton instance `supabase` for DB queries, Auth, and Storage.
 * - Used throughout the application to interface with the database.
 */

import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your actual Supabase project URL and Anon Key or a dummy one to test out features(Empty string won't let the dev version to even run)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// It's recommended to create a .env.local file in your project root:
/*
NEXT_PUBLIC_SUPABASE_URL="Supabase URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="Supabase Anon Key"
NEXT_PUBLIC_ADMIN_EMAIL="Admin Email"
*/
