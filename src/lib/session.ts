
import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { User } from '@/types';

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);
const COOKIE_NAME = 'session';

export async function encrypt(payload: any) {
  if (!secretKey) {
      throw new Error('SESSION_SECRET environment variable is not set.');
  }
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // The session will expire in 7 days
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
  if (!secretKey) {
      throw new Error('SESSION_SECRET environment variable is not set.');
  }
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.log('Failed to verify session');
    return null;
  }
}

// --- Cookie management functions ---

export async function createSession(user: User) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({ user, expires });

  cookies().set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expires,
    path: '/',
    sameSite: 'lax',
  });
}

export async function getSession(): Promise<{ user: User } | null> {
  const cookie = cookies().get(COOKIE_NAME)?.value;
  const session = await decrypt(cookie);

  if (!session || typeof session !== 'object' || !('user' in session)) {
      return null;
  }
  
  // Check if the session has expired
  if (new Date(session.expires as string) < new Date()) {
      return null;
  }

  return { user: session.user as User };
}


export async function deleteSession() {
  cookies().delete(COOKIE_NAME);
}
