import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // This is the crucial line that enables SSR.
  output: "server",
  
  // This is the correct, modern import for the adapter.
  adapter: vercel()
});