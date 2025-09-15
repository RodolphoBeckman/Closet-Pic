'use server';
import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { UserSession } from '@/types';

const cookieName = 'session';

function getSecretKey() {
  const secretKey = process.env.SESSION_SECRET;
  if (!secretKey) {
    throw new Error('A variável de ambiente SESSION_SECRET não foi definida.');
  }
  return new TextEncoder().encode(secretKey);
}

export async function encrypt(payload: UserSession) {
  const encodedKey = getSecretKey();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
  if (!session) return null;
  try {
    const encodedKey = getSecretKey();
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as unknown as UserSession;
  } catch (error) {
    console.log('Failed to verify session');
    return null;
  }
}

export async function createSession(user: UserSession) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt(user);

  cookies().set(cookieName, session, {
    expires,
    httpOnly: true,
    path: '/',
  });
}

export async function getSession(): Promise<UserSession | null> {
  const cookie = cookies().get(cookieName)?.value;
  return await decrypt(cookie);
}

export async function deleteSession() {
  cookies().delete(cookieName);
}
