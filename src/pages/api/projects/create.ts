import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { initData, profile_id, title, description, image_url } = await request.json();
    const user = await validate(initData);
    if (!user) { return new Response(JSON.stringify({ error: 'Invalid user.' }), { status: 401 }); }

    // Security Check: Does the profile_id belong to the validated user?
    const { data: profile } = await supabase.from('profiles')
      .select('id').eq('telegram_id', user.id).eq('id', profile_id).single();
    if (!profile) {
      return new Response(JSON.stringify({ error: 'Authorization error.' }), { status: 403 });
    }

    const { data, error } = await supabase.from('projects').insert([{ 
      profile_id, title, description, image_url 
    }]).select().single();

    if (error) throw error;
    return new Response(JSON.stringify(data), { status: 201 });
  } catch (err) {
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};