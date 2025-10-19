import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// We go back to the simplest possible client. No headers, no login function.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);