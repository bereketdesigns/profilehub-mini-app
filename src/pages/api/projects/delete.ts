import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { initData, id } = await request.json();
    const user = await validate(initData);
    if (!user) { return new Response(JSON.stringify({ error: 'Invalid user.' }), { status: 401 }); }

    const { error } = await supabase.from('projects')
      .delete()
      .eq('id', id);

    if (error) { throw error; }

    return new Response(JSON.stringify({ message: 'Project deleted' }), { status: 200 });
  } catch (err) {
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};