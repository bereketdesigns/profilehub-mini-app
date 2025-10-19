/// <reference types="astro/client" />

// This declares that the global 'Window' object will have a 'Telegram' property.
// This solves the "Property 'Telegram' does not exist" error.
declare global {
  interface Window {
    Telegram: any;
  }
}

// This line is needed to make TypeScript treat this file as a module.
export {};