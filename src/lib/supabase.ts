import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Define the type for our headers object to solve the implicit 'any' error.
const headers: { [key: string]: string } = {};

// Check if running in a browser context and if the Telegram script has loaded.
if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
  // If so, add the initData to a custom header for every request.
  headers['X-Telegram-Init-Data'] = window.Telegram.WebApp.initData;
}

// Create the Supabase client with the (potentially empty) custom headers object.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers,
  },
});