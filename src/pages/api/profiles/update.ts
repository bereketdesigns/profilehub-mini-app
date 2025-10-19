import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { initData, username, bio, contact_link } = await request.json();
    
    const user = await validate(initData);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid user data.' }), { status: 401 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ username, bio, contact_link: contact_link || null })
      .eq('telegram_id', user.id) // Security is handled here
      .select();

    if (error) { throw error; }
    if (!data || data.length === 0) { throw new Error('Profile not found to update.'); }
    
    return new Response(JSON.stringify(data[0]), { status: 200 });
  } catch (err) {
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};