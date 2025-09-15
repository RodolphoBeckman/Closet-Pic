import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// 1. Specify protected and public routes
const protectedRoutes = ['/'];
const publicRoutes = ['/login', '/register'];

// This secret key is used to verify the session cookie.
// It must match the one used in `src/lib/session.ts`.
// We define it here directly to ensure it's available in the Edge runtime.
const secretKey = process.env.SESSION_SECRET;

async function verifySession(sessionCookie: string | undefined) {
  if (!sessionCookie || !secretKey) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      sessionCookie,
      new TextEncoder().encode(secretKey),
      { algorithms: ['HS256'] }
    );
    return payload;
  } catch (error) {
    console.error('Failed to verify session in middleware:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const cookie = request.cookies.get('session')?.value;
  const session = await verifySession(cookie);

  // 4. Redirect logic
  // If the user is trying to access a protected route and doesn't have a valid session,
  // redirect them to the login page.
  if (isProtectedRoute && !session?.email) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // If the user is logged in and tries to access a public route (like login or register),
  // redirect them to the home page.
  if (isPublicRoute && session?.email && !request.nextUrl.pathname.startsWith('/')) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
