import { createClient } from '@supabase/supabase-js';

// Frontend Supabase client using public anon key
// Vite-style environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Basic safeguard to help diagnose env issues in development
  // Do not throw in production build pipelines automatically
  // eslint-disable-next-line no-console
  console.warn('Supabase URL or Anon Key is missing. Check your .env setup.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
