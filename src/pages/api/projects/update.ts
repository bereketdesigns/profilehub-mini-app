import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { initData, id, title, description, image_url } = await request.json();
    const user = await validate(initData);
    if (!user) { return new Response(JSON.stringify({ error: 'Invalid user.' }), { status: 401 }); }
    
    const { data, error } = await supabase.from('projects')
      .update({ title, description, image_url })
      .eq('id', id) // The user can only update their own project due to RLS policies
      .select()
      .single();

    if (error) { throw error; }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};