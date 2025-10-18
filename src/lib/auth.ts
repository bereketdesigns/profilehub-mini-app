/// <reference types="astro/client" />

const BOT_TOKEN = import.meta.env.TELEGRAM_BOT_TOKEN;

/**
 * Securely validates the initData string from the Telegram Mini App.
 * @param initData The initData string from `window.Telegram.WebApp.initData`.
 * @returns The validated user data object if successful, otherwise null.
 */
export async function validate(initData: string) {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  
  const user = JSON.parse(urlParams.get('user') || '{}');

  if (!hash || !user.id) {
    return null;
  }
  
  urlParams.delete('hash');
  
  const entries = Array.from(urlParams.entries());
  entries.sort(([a], [b]) => a.localeCompare(b));
  
  const dataCheckString = entries.map(([key, value]) => `${key}=${value}`).join('\n');
  
  // --- The Cryptographic Validation (Corrected for Node.js/Astro SSR) ---
  
  // 1. Create the "secret_key" from "WebAppData"
  const secretKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('WebAppData'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  // 2. Create the "bot_token" key for signing
  const botTokenHmac = await crypto.subtle.sign(
    'HMAC',
    secretKey,
    new TextEncoder().encode(BOT_TOKEN)
  );

  // 3. !!! THIS IS THE FIX !!!
  // Import the result of the last step as a new CryptoKey that can be used for signing.
  const signingKey = await crypto.subtle.importKey(
    'raw',
    botTokenHmac,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  // 4. Sign the data-check-string with the final signing key
  const hmac = await crypto.subtle.sign(
    'HMAC',
    signingKey, // Use the imported key, not the raw ArrayBuffer
    new TextEncoder().encode(dataCheckString)
  );
  
  const hmacHex = Array.from(new Uint8Array(hmac)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  if (hmacHex === hash) {
    return user;
  }

  return null;
}