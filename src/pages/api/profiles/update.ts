import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.json();
    // !!! BUG 2 FIX: Ensure we are getting contact_link from the form data !!!
    const { initData, username, bio, contact_link } = formData;

    if (!initData || !username) { // Bio can be empty, but username is required
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const user = await validate(initData);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid user data. Unauthorized.' }), { status: 401 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        username, 
        bio, 
        contact_link // <-- BUG 2 FIX: Add contact_link to the update object
      })
      .eq('telegram_id', user.id)
      .select();

    if (error) { throw new Error(`Database update error: ${error.message}`); }
    if (!data || data.length === 0) { throw new Error('Profile not found to update.'); }

    return new Response(JSON.stringify(data[0]), { status: 200 });
  } catch (err) {
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};