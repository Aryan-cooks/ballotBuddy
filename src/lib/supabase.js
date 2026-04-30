import { createClient } from '@supabase/supabase-js';

// Use environment variables when available (set in Vercel or .env.local),
// fall back to hardcoded values so the app never white-screens.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://pflpodnvzmnthsuallqa.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmbHBvZG52em1udGhzdWFsbHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjMzOTEsImV4cCI6MjA5MzAzOTM5MX0.pAByEwAizv9NxWRKMUu7Cj3W-h9RZTqgXihjTYXUR88';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
