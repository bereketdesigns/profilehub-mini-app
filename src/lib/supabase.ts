import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Create the base client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- New Authentication Logic ---
// This function logs the user in and gets a JWT
export async function loginWithTelegram() {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: window.Telegram.WebApp.initData }),
      });
      if (!response.ok) throw new Error('Login failed');
      const { accessToken } = await response.json();

      // Set the session for the Supabase client
      supabase.auth.setSession({ access_token: accessToken, refresh_token: '' });
      console.log('Successfully logged in with Telegram and set Supabase session.');

    } catch (error) {
      console.error('Telegram login process failed:', error);
    }
  }
}