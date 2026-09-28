// Eenvoudige admin-sessie: een HMAC-ondertekende cookie met vervaldatum.
// Gebruikt Web Crypto zodat het zowel in middleware (edge) als in Node werkt.

export const SESSION_COOKIE = 'shop-admin';
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 uur

const encoder = new TextEncoder();

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('SESSION_SECRET ontbreekt of is te kort (minimaal 16 tekens)');
  }
  return secret;
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken() {
  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `admin.${expires}`;
  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return false;
  const lastDot = token.lastIndexOf('.');
  if (lastDot < 0) return false;
  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  const expires = Number(payload.split('.')[1]);
  if (!expires || expires < Date.now()) return false;
  try {
    return timingSafeEqual(signature, await sign(payload));
  } catch {
    return false;
  }
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return timingSafeEqual(input, expected);
}
