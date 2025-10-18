import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth'; // Our secure validation function

// This endpoint checks if a profile exists for the current user.
export const POST: APIRoute = async ({ request }) => {
  const { initData } = await request.json();

  if (!initData) {
    return new Response(JSON.stringify({ error: 'initData is required' }), { status: 400 });
  }

  // Securely validate the user
  const user = await validate(initData);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid user data' }), { status: 401 });
  }

  // Check for an existing profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username') // We only need a little bit of data to confirm existence
    .eq('telegram_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore 'row not found' errors
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Respond with the profile if found, or a clear message if not.
  if (profile) {
    return new Response(JSON.stringify({ status: 'found', profile }), { status: 200 });
  } else {
    return new Response(JSON.stringify({ status: 'not_found' }), { status: 404 });
  }
};