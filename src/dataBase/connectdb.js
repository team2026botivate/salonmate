// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rrazucbltvxhlpnqdnsi.supabase.co"

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyYXp1Y2JsdHZ4aGxwbnFkbnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDgxNzcsImV4cCI6MjA3MDEyNDE3N30.Zc5XNLm5w8AJPMegN4h2vEzWIBnlXzYZ7C55yDvUlio"

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase