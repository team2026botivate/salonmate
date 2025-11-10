// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Read from Vite env (must be prefixed with VITE_)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Helpful warning during development
  // Ensure you create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
  console.warn(
    'Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
