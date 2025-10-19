import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { initData, username, bio, profile_picture_url, contact_link, profession } = await request.json();
    
    const user = await validate(initData);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid user data.' }), { status: 401 });
    }
    
    const { data: existingProfile } = await supabase.from('profiles').select('id').eq('telegram_id', user.id).single();
    if (existingProfile) {
      return new Response(JSON.stringify({ error: 'Profile already exists.' }), { status: 409 });
    }

    const { data, error } = await supabase.from('profiles').insert([{ 
        telegram_id: user.id, 
        username, 
        bio, 
        profile_picture_url, 
        contact_link, 
        profession 
      }]).select().single();

    if (error) {
      throw error;
    }
    return new Response(JSON.stringify(data), { status: 201 });
  } catch (err) {
    const error = err as Error;
    console.error('Create API Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};