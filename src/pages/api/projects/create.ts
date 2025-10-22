import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { initData, title, description, image_url } = await request.json();
    const user = await validate(initData);
    if (!user) { return new Response(JSON.stringify({ error: 'Invalid user.' }), { status: 401 }); }
    
    const { data: profile } = await supabase.from('profiles').select('id').eq('telegram_id', user.id).single();
    if (!profile) { return new Response(JSON.stringify({ error: 'Profile not found.' }), { status: 404 }); }

    const { data, error } = await supabase.from('projects').insert([{
      profile_id: profile.id, // Link to the user's profile
      title,
      description,
      image_url
    }]).select().single();
    
    if (error) { throw error; }

    return new Response(JSON.stringify(data), { status: 201 });
  } catch (err) {
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};