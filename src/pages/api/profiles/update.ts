import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth';

// --- THIS IS THE FIX: Ensure all paths return a value ---
function formatContactLink(input: string | null | undefined): string | null {
  if (!input || input.trim() === '') {
    return null; // Explicitly return null for empty input
  }
  const cleanedInput = input.trim().replace(/^@/, '');
  if (cleanedInput.startsWith('http://') || cleanedInput.startsWith('https://')) {
    return cleanedInput;
  }
  return `https://t.me/${cleanedInput}`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { initData, username, bio, contact_link, portfolio_link, profession, profile_picture_url } = await request.json();

    const user = await validate(initData);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid user data.' }), { status: 401 });
    }

    const formattedContactLink = formatContactLink(contact_link);

    const { data, error } = await supabase.from('profiles')
      .update({ 
        username, 
        bio, 
        contact_link: formattedContactLink,
        portfolio_link,
        profession,
        profile_picture_url
      })
      .eq('telegram_id', user.id)
      .select();

    if (error) { throw error; }
    if (!data || data.length === 0) { throw new Error('Profile not found to update.'); }
    
    return new Response(JSON.stringify(data[0]), { status: 200 });
  } catch (err) {
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};