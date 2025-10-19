import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { initData } = await request.json();

    if (!initData) {
      return new Response(JSON.stringify({ error: 'initData is required' }), { status: 400 });
    }

    const user = await validate(initData);
    if (!user) {
      return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('telegram_id', user.id)
      .single();

    if (error || !profile) {
      // It's not an error if the profile isn't found, it just means they're a new user.
      return new Response(JSON.stringify({ status: 'not_found' }), { status: 404 });
    }

    // Success! Return the found profile.
    return new Response(JSON.stringify({ status: 'found', profile }), { status: 200 });

  } catch (err) {
    const error = err as Error;
    console.error("Error in /api/profiles/me:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};