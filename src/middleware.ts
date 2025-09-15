
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session';

const publicRoutes = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = req.cookies.get('session')?.value;
  const session = await decrypt(cookie);

  if (isPublicRoute && session?.email) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  if (!isPublicRoute && !session?.email) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
