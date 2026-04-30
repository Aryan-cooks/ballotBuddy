import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pflpodnvzmnthsuallqa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmbHBvZG52em1udGhzdWFsbHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjMzOTEsImV4cCI6MjA5MzAzOTM5MX0.pAByEwAizv9NxWRKMUu7Cj3W-h9RZTqgXihjTYXUR88';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
