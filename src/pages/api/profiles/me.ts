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

    // --- THIS IS THE DEFINITIVE FIX ---
    // The query now correctly joins and fetches the related projects.
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        projects ( * )
      `)
      .eq('telegram_id', user.id)
      .single();

    if (error || !profile) {
      return new Response(JSON.stringify({ status: 'not_found' }), { status: 404 });
    }

    // Success! Return the profile, which now includes the 'projects' array.
    return new Response(JSON.stringify({ status: 'found', profile }), { status: 200 });

  } catch (err) {
    const error = err as Error;
    console.error("Error in /api/profiles/me:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};