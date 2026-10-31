import bcrypt from 'bcryptjs';

const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    KEY_BYTES * 8
  );
  const saltHex = [...salt].map((b) => b.toString(16).padStart(2, '0')).join('');
  const hashHex = [...new Uint8Array(derived)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `pbkdf2:${ITERATIONS}:${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash || typeof storedHash !== 'string' || !password || typeof password !== 'string') {
    return false;
  }

  // Support legacy bcrypt hashes ($2a$, $2b$, $2y$)
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
    try {
      const compareFn = (bcrypt as unknown as { compare?: typeof bcrypt.compare; default?: { compare: typeof bcrypt.compare } }).compare ||
        (bcrypt as unknown as { default?: { compare: typeof bcrypt.compare } }).default?.compare ||
        bcrypt.compare;
      return await compareFn(password, storedHash);
    } catch (err) {
      console.error('Error verifying legacy bcrypt password:', err);
      return false;
    }
  }

  const parts = storedHash.split(':');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
    return false;
  }

  const [, iterStr, saltHex, expectedHashHex] = parts;
  const iterations = parseInt(iterStr, 10);
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    expectedHashHex.length * 4
  );
  const computedHex = [...new Uint8Array(derived)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return computedHex === expectedHashHex;
}
