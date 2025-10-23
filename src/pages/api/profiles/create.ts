import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth';

function formatContactLink(input: string | null | undefined): string | null {
  if (!input || input.trim() === '') {
    return null;
  }
  const cleanedInput = input.trim().replace(/^@/, '');
  if (cleanedInput.startsWith('http://') || cleanedInput.startsWith('https://')) {
    return cleanedInput;
  }
  return `https://t.me/${cleanedInput}`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { initData, username, bio, profile_picture_url, contact_link, portfolio_link, profession } = await request.json();
    
    const user = await validate(initData);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid user data.' }), { status: 401 });
    }
    
    const { data: existingProfile } = await supabase.from('profiles').select('id').eq('telegram_id', user.id).single();
    if (existingProfile) {
      return new Response(JSON.stringify({ error: 'Profile already exists.' }), { status: 409 });
    }

    const formattedContactLink = formatContactLink(contact_link);

    const { data, error } = await supabase.from('profiles').insert([{ 
        telegram_id: user.id, 
        username, 
        bio, 
        profile_picture_url, 
        contact_link: formattedContactLink,
        portfolio_link, // Add the new field
        profession 
      }]).select().single();

    if (error) {
      throw error;
    }
    return new Response(JSON.stringify(data), { status: 201 });
  } catch (err) {
    const error = err as Error;
    console.error('Create API Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};