'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

const protectedRoutes = ['/'];
const publicRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get('session')?.value;
  const session = await decrypt(cookie);

  const isProtectedRoute = protectedRoutes.includes(pathname);
  const isPublicRoute = publicRoutes.includes(pathname);

  // Se a rota é protegida e não há sessão, redirecione para o login.
  if (isProtectedRoute && !session?.email) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // Se a rota é pública e há uma sessão, redirecione para a home.
  if (isPublicRoute && session?.email) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  return NextResponse.next();
}

// Rotas em que o Middleware deve ser executado
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|LOGO.png|manifest.webmanifest).*)'],
};
