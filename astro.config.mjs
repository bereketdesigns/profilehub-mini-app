import { defineConfig } from 'astro/config';

// It's slightly better to import from the 'serverless' entry point
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  // This is the crucial line that was missing.
  // It tells Astro to build a dynamic, server-rendered application.
  output: "server",
  
  // This tells Astro how to package the server code for Vercel.
  adapter: vercel()
});