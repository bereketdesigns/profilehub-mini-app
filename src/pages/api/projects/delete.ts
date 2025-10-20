import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { initData, project_id } = await request.json();
    const user = await validate(initData);
    if (!user) { return new Response(JSON.stringify({ error: 'Invalid user.' }), { status: 401 }); }

    // --- THE FIX ---
    // 1. Get the user's own profile ID first.
    const { data: userProfile } = await supabase.from('profiles')
      .select('id').eq('telegram_id', user.id).single();
    if (!userProfile) {
      return new Response(JSON.stringify({ error: 'User profile not found.' }), { status: 404 });
    }

    // 2. Get the project and check if it belongs to this user.
    const { data: project } = await supabase.from('projects')
      .select('id, profile_id').eq('id', project_id).single();
    if (!project || project.profile_id !== userProfile.id) {
      return new Response(JSON.stringify({ error: 'Authorization error. Project does not belong to user.' }), { status: 403 });
    }
    // --- END FIX ---

    // Now that security is confirmed, perform the delete.
    const { error } = await supabase.from('projects')
      .delete()
      .eq('id', project_id);
    
    if (error) throw error;
    return new Response(JSON.stringify({ message: 'Project deleted successfully.' }), { status: 200 });
  } catch (err) {
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};