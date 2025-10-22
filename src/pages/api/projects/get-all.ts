import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { initData } = await request.json();
    const user = await validate(initData);
    if (!user) { return new Response(JSON.stringify({ error: 'Invalid user.' }), { status: 401 }); }

    // First, get the user's profile to find their profile ID
    const { data: profile } = await supabase.from('profiles').select('id').eq('telegram_id', user.id).single();
    if (!profile) { return new Response(JSON.stringify({ projects: [] }), { status: 200 }); }
    
    // Now, fetch all projects linked to that profile ID
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('profile_id', profile.id)
      .order('display_order', { ascending: true });

    if (error) { throw error; }
    
    return new Response(JSON.stringify({ projects }), { status: 200 });
  } catch (err) {
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};