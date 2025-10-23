/// <reference types="astro/client" />
/// <reference types="@twa-dev/types" />
// This declares that the global 'Window' object will have a 'Telegram' property.
// This solves the "Property 'Telegram' does not exist" error.
    // src/vite-env.d.ts or types.ts

declare global {
  interface Window {
    Telegram: any;
  }
}

// This line is needed to make TypeScript treat this file as a module.
export {};