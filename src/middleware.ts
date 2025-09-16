import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const session = await getSession();
  const path = req.nextUrl.pathname;

  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(path);

  // REGRA 1: Se o utilizador está logado e tenta aceder a uma rota pública, redireciona para a home.
  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  // REGRA 2: Se o utilizador não está logado e tenta aceder a uma rota protegida, redireciona para o login.
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Em todos os outros casos, permite o acesso.
  return NextResponse.next();
}

export const config = {
  // O middleware será executado em todas as rotas, EXCETO naquelas que correspondem a:
  // - /api/ (rotas de API)
  // - /_next/static (ficheiros estáticos)
  // - /_next/image (ficheiros de otimização de imagem)
  // - /favicon.ico (ícone do site)
  // - /LOGO.png (o seu logo)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|LOGO.png).*)'],
};
