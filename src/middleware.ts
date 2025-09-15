
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session';

// 1. Especifique as rotas protegidas e públicas
const protectedRoutes = ['/'];
const publicRoutes = ['/login', '/register'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // 2. Decodifique a sessão do cookie
  const cookie = req.cookies.get('session')?.value;
  const session = await decrypt(cookie);

  // 3. Lógica de redirecionamento
  if (isProtectedRoute && !session?.email) {
    // O usuário não está autenticado e está tentando acessar uma rota protegida
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (isPublicRoute && session?.email) {
    // O usuário está autenticado e tentando acessar uma rota pública (por exemplo, página de login)
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  return NextResponse.next();
}

// Rotas nas quais o Middleware deve ser executado
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
