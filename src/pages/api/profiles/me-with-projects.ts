import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth';

// This new endpoint fetches the profile AND all its associated projects in one go.
export const POST: APIRoute = async ({ request }) => {
  try {
    const { initData } = await request.json();
    const user = await validate(initData);
    if (!user) { return new Response(null, { status: 401 }); }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, projects (*, profile_id)')
      .eq('telegram_id', user.id)
      .single();

    if (error || !profile) { return new Response(null, { status: 404 }); }
    return new Response(JSON.stringify({ profile }), { status: 200 });
  } catch (err) {
    return new Response(null, { status: 500 });
  }
};