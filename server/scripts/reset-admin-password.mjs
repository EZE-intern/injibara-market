import { connect } from '@tidbcloud/serverless';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.dev.vars or server/.env
dotenv.config({ path: path.resolve(__dirname, '../.dev.vars') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;

async function hashPassword(password) {
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

async function main() {
  const targetEmail = (process.argv[2] || 'seberbel@gmail.com').trim().toLowerCase();
  const newPassword = process.argv[3];

  if (!newPassword) {
    console.error('Usage: node scripts/reset-admin-password.mjs <email> <newPassword>');
    console.error('Example: node scripts/reset-admin-password.mjs seberbel@gmail.com MyNewSecurePassword123');
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL_MYSQL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Error: DATABASE_URL not found in environment.');
    process.exit(1);
  }

  // Parse connection url for @tidbcloud/serverless
  const cleanUrl = dbUrl.replace(/^mariadb:\/\//, 'mysql://');
  const conn = connect({ url: cleanUrl });

  console.log(`Checking user "${targetEmail}" in database...`);
  const rows = await conn.execute(
    'SELECT id, email, full_name, role, password FROM users WHERE email = ?',
    [targetEmail]
  );

  if (!rows || rows.length === 0) {
    console.error(`User with email "${targetEmail}" not found in database.`);
    process.exit(1);
  }

  const user = rows[0];
  console.log(`Found user: ID=${user.id}, FullName="${user.full_name}", CurrentRole="${user.role}"`);

  const hashedPassword = await hashPassword(newPassword);

  await conn.execute(
    'UPDATE users SET password = ?, role = "admin", updated_at = NOW() WHERE id = ?',
    [hashedPassword, user.id]
  );

  console.log(`Successfully updated password and ensured admin role for "${targetEmail}"!`);
  console.log(`Hash algorithm: PBKDF2 (SHA-256, 100,000 iterations).`);
}

main().catch((err) => {
  console.error('Error resetting password:', err);
  process.exit(1);
});
