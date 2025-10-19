import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth'; // Our original validation function

export const POST: APIRoute = async ({ request }) => {
  try {
    const { initData, username, bio, profile_picture_url, contact_link } = await request.json();

    const user = await validate(initData);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid user data.' }), { status: 401 });
    }
    
    // Check for existing profile
    const { data: existingProfile } = await supabase
      .from('profiles').select('id').eq('telegram_id', user.id).single();
    if (existingProfile) {
      return new Response(JSON.stringify({ error: 'Profile already exists.' }), { status: 409 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([{ 
        telegram_id: user.id, // Use the validated ID
        username, bio, profile_picture_url, contact_link 
      }])
      .select().single();

    if (error) { throw error; }
    return new Response(JSON.stringify(data), { status: 201 });
  } catch (err) {
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};