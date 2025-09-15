
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session';

const publicRoutes = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = req.cookies.get('session')?.value;
  const session = await decrypt(cookie);

  // Se o utilizador está logado e tenta aceder a uma página pública (login/registo),
  // redireciona-o para a página principal.
  if (isPublicRoute && session?.email) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  // Se o utilizador não está logado e tenta aceder a uma página protegida,
  // redireciona-o para a página de login.
  if (!isPublicRoute && !session?.email) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Em todos os outros casos (utilizador logado em página protegida, ou não logado em página pública),
  // permite que a requisição continue.
  return NextResponse.next();
}

export const config = {
  // Executa o middleware em todas as rotas, exceto nas de API, ficheiros estáticos, imagens e favicon.
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
