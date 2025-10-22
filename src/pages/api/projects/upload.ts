import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const POST: APIRoute = async ({ request }) => {
  try {
    const bucket = request.headers.get('x-bucket'); // Get the target bucket from the header
    if (bucket !== 'profile-pictures' && bucket !== 'project-images') {
      return new Response(JSON.stringify({ error: 'Invalid bucket specified' }), { status: 400 });
    }

    const file = await request.blob();
    const fileExtension = file.type.split('/')[1];
    const fileName = `${uuidv4()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket) // Use the dynamic bucket name
      .upload(fileName, file);

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
      
    if (!urlData.publicUrl) throw new Error('Could not get public URL.');

    return new Response(JSON.stringify({ url: urlData.publicUrl }), { status: 200 });
  } catch (err) {
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};