import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth';

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { initData, project_id } = await request.json();

    if (!initData || !project_id) {
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
    const ownerProfile = Array.isArray(projectOwner?.profiles) 
      ? projectOwner.profiles[0] 
      : projectOwner?.profiles;

    if (ownerError || !ownerProfile || ownerProfile.telegram_id !== user.id) {
        return new Response(JSON.stringify({ error: 'Authorization error' }), { status: 403 });
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', project_id);

    if (error) { throw error; }
    return new Response(JSON.stringify({ message: 'Project deleted successfully' }), { status: 200 });

  } catch (err) {
    const error = err as Error;
    console.error('Delete Project API Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};