/// <reference types="astro/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

const headers = {};
// Check if running in a browser and if Telegram data is available
if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
  // If so, add the initData to a custom header for every request
  headers['X-Telegram-Init-Data'] = window.Telegram.WebApp.initData;
}

// Create the Supabase client with the custom headers
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers,
  },
});