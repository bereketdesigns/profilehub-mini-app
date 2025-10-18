import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
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
      // We are not updating the picture in this step for simplicity
    })
    .eq('telegram_id', user.id) // This ensures users can ONLY update their own profile
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: `Database update error: ${error.message}` }), { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 }); // 200 OK
};