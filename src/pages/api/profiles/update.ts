import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.json();
    const { initData, username, bio, contact_link } = formData;

    if (!initData || !username || !bio) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Securely validate the user's identity
    const user = await validate(initData);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid user data. Unauthorized.' }), { status: 401 });
    }

    // Update the profile where the telegram_id matches the validated user's ID
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        username, 
        bio, 
        contact_link
      })
      .eq('telegram_id', user.id)
      .select(); // <-- REMOVED .single() FROM HERE

    if (error) {
      throw new Error(`Database update error: ${error.message}`);
    }

    if (!data || data.length === 0) {
        throw new Error('Profile not found to update.');
    }

    // Return the first (and only) item from the resulting array
    return new Response(JSON.stringify(data[0]), { status: 200 });
  } catch (err) {
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};