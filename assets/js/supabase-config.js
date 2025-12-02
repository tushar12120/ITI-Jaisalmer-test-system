// Supabase Configuration
// Replace with your actual Supabase URL and Anon Key
const SUPABASE_URL = 'https://ovdqugnzhbagsjnjgljs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92ZHF1Z256aGJhZ3NqbmpnbGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNjQxNzksImV4cCI6MjA3OTg0MDE3OX0.b9BizXHK-3cMHmMOh3N7oKHowXOMpg8YTMVrm_C3uZo';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
