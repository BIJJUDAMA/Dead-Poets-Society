// src/supabase/config.js
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your actual Supabase project URL and Anon Key
// You should store these in environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// It's recommended to create a .env.local file in your project root:
/*
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
VITE_ADMIN_EMAIL="your-admin-email@example.com"
*/
