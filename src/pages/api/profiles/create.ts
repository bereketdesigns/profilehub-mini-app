import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validate } from '../../../lib/auth'; // Our secure validation function

export const POST: APIRoute = async ({ request }) => {
  // 1. Get the form data and the user's secret initData string
  const formData = await request.json();
  const { initData, username, bio, profile_picture_url, contact_link } = formData;

  if (!initData || !username || !bio || !profile_picture_url) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  // 2. Securely validate the user's identity
  const user = await validate(initData);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid or tampered user data. Unauthorized.' }), { status: 401 });
  }
  
  // 3. Check if a profile for this user already exists
  const { data: existingProfile, error: selectError } = await supabase
    .from('profiles')
    .select('id')
    .eq('telegram_id', user.id)
    .single();

  if (selectError && selectError.code !== 'PGRST116') { // PGRST116 is 'row not found', which is OK
    return new Response(JSON.stringify({ error: `Database error: ${selectError.message}` }), { status: 500 });
  }

  if (existingProfile) {
    return new Response(JSON.stringify({ error: 'A profile for this user already exists.' }), { status: 409 }); // 409 Conflict
  }

  // 4. If validation passes and no profile exists, insert the new profile
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ 
      telegram_id: user.id, // Use the TRUSTED id from validation
      username, 
      bio, 
      profile_picture_url, 
      contact_link 
    }])
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: `Database insert error: ${error.message}` }), { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 201 }); // 201 Created
};