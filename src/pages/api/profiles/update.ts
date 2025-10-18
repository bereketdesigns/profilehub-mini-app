import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.json();
    const { initData, username, bio, contact_link } = formData;

    if (!initData || !username) { // Bio can be optional if needed, but we'll require it for now
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const user = await validate(initData);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid user data. Unauthorized.' }), { status: 401 });
    }

    // Perform the update. We no longer need to select the data back.
    const { error } = await supabase
      .from('profiles')
      .update({ 
        username, 
        bio, 
        contact_link: contact_link || null // Explicitly set to null if empty
      })
      .eq('telegram_id', user.id);

    if (error) {
      throw new Error(`Database update error: ${error.message}`);
    }

    // !!! SIMPLIFIED RESPONSE !!!
    // Just return a success message.
    return new Response(JSON.stringify({ message: 'Profile updated successfully' }), { status: 200 });

  } catch (err) {
    const error = err as Error;
    console.error('Update API Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};