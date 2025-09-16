
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

const publicRoutes = ['/login', '/register'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Check if the current route is public
  const isPublicRoute = publicRoutes.includes(path);

  // Get the session cookie
  const cookie = cookies().get('session')?.value;
  const session = await decrypt(cookie);

  // Redirect logic
  if (isPublicRoute && session?.user) {
    // If user is logged in and tries to access a public route, redirect to home
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }
  
  if (!isPublicRoute && !session?.user) {
    // If user is not logged in and tries to access a protected route, redirect to login
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Allow the request to proceed
  return NextResponse.next();
}


// Define which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - *.png, *.svg, etc. (image files)
     */
    '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|favicon.ico|manifest.webmanifest|LOGO.png).*)',
  ],
}
