import type { APIRoute } from 'astro';
import { validate } from '../../../lib/auth'; // We are re-using our secure validation function
import jwt from 'jsonwebtoken';

// This reads the JWT secret you will add to Vercel/your .env file
const SUPABASE_JWT_SECRET = import.meta.env.SUPABASE_JWT_SECRET;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { initData } = await request.json();

    if (!initData) {
      return new Response(JSON.stringify({ error: 'initData is required' }), { status: 400 });
    }

    if (!SUPABASE_JWT_SECRET) {
      throw new Error('Supabase JWT Secret is not configured on the server.');
    }

    // 1. Securely validate the user with our existing function
    const user = await validate(initData);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication data' }), { status: 401 });
    }

    // 2. If valid, create a custom Supabase JWT
    const payload = {
      sub: user.id.toString(), // 'sub' is the standard JWT claim for the user ID
      role: 'anon',            // We are logging them in with the 'anon' role
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // Token expires in 24 hours
    };

    // 3. Sign the token with our secret
    const token = jwt.sign(payload, SUPABASE_JWT_SECRET);

    // 4. Send the token back to the user's browser
    return new Response(JSON.stringify({ accessToken: token }), { status: 200 });

  } catch (err) {
    const error = err as Error;
    console.error('Login API Error:', error.message);
    return new Response(JSON.stringify({ error: 'An internal server error occurred.' }), { status: 500 });
  }
};