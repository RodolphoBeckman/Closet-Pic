import { NextResponse, type NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

// 1. Specify protected and public routes
const protectedRoutes = ['/'];
const publicRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 2. Check if the current route is protected or public
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const cookie = request.cookies.get('session')?.value;
  const session = await decrypt(cookie);

  // 5. Redirect logic
  if (isProtectedRoute && !session?.email) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  if (
    isPublicRoute &&
    session?.email &&
    !request.nextUrl.pathname.startsWith('/')
  ) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
