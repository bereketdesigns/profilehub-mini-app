import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth';

export const PUT: APIRoute = async ({ request }) => {
  try {
    const { initData, project_id, title, description, image_url } = await request.json();

    if (!initData || !project_id || !title || !image_url) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const user = await validate(initData);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid user data' }), { status: 401 });
    }
    
    const { data: projectOwner, error: ownerError } = await supabase
      .from('projects')
      .select('profiles ( telegram_id )')
      .eq('id', project_id)
      .single();
    
    // !!! DEFINITIVE FIX !!! Safely access the nested property.
    // Supabase can return the relation as an object or an array. We handle both.
    const ownerProfile = Array.isArray(projectOwner?.profiles) 
      ? projectOwner.profiles[0] 
      : projectOwner?.profiles;

    if (ownerError || !ownerProfile || ownerProfile.telegram_id !== user.id) {
        return new Response(JSON.stringify({ error: 'Authorization error' }), { status: 403 });
    }

    const { data, error } = await supabase
      .from('projects')
      .update({ title, description, image_url })
      .eq('id', project_id)
      .select()
      .single();

    if (error) { throw error; }
    return new Response(JSON.stringify(data), { status: 200 });

  } catch (err) {
    const error = err as Error;
    console.error('Update Project API Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};