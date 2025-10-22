import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { initData, profile_id, title, description, image_url } = await request.json();

    if (!initData || !profile_id || !title || !image_url) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const user = await validate(initData);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid user data' }), { status: 401 });
    }

    const { data: profileOwner, error: ownerError } = await supabase
      .from('profiles')
      .select('telegram_id')
      .eq('id', profile_id)
      .single();

    if (ownerError || !profileOwner || profileOwner.telegram_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Authorization error' }), { status: 403 });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([{ profile_id, title, description, image_url }])
      .select()
      .single();

    if (error) { throw error; }
    return new Response(JSON.stringify(data), { status: 201 });

  } catch (err) {
    const error = err as Error;
    console.error('Create Project API Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};