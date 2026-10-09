import { SignJWT, jwtVerify } from 'jose';

export const JWT_SECRET = (typeof process !== 'undefined' ? process.env?.JWT_SECRET : undefined) || 'MIKAEL_ARTETA_ARSENAL';

export async function generateToken(
  id: string | number,
  role?: string,
  email?: string,
  jwtSecret?: string
): Promise<string> {
  const secretKey = new TextEncoder().encode(jwtSecret || JWT_SECRET);
  return new SignJWT({ id, role: role || 'customer', email: email || '' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secretKey);
}

export async function verifyToken(
  token: string,
  jwtSecret?: string
): Promise<{ id: number; role: string; email: string }> {
  const secretKey = new TextEncoder().encode(jwtSecret || JWT_SECRET);
  const { payload } = await jwtVerify(token, secretKey);
  return payload as unknown as { id: number; role: string; email: string };
}

export default generateToken;
