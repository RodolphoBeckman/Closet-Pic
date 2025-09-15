'use server';
import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { UserSession } from '@/types';

const cookieName = 'session';

function getSecretKey() {
  let secretKey = process.env.SESSION_SECRET;

  // IMPORTANT: This is an insecure fallback for local development ONLY.
  // A secure, unique SESSION_SECRET must be set in the production environment.
  if (!secretKey) {
    secretKey = 'insecure-fallback-secret-for-development-only-must-be-changed-in-production';
    console.warn(
      'ADVERTÊNCIA: A variável de ambiente SESSION_SECRET não foi definida. ' +
      'Usando uma chave de fallback insegura apenas para desenvolvimento local. ' +
      'É crucial definir uma chave secreta forte e única no seu ambiente de produção (ex: Vercel).'
    );
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
