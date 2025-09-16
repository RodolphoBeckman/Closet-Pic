import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

// Rotas que não requerem autenticação
const publicRoutes = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);
  
  // Obtém a sessão diretamente do cookie.
  const session = await getSession();

  // REGRA 1: Redirecionar para a página principal se o utilizador estiver logado e tentar aceder a uma rota pública.
  if (isPublicRoute && session?.email) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  // REGRA 2: Redirecionar para o login se o utilizador não estiver logado e tentar aceder a uma rota protegida.
  if (!isPublicRoute && !session?.email) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Se nenhuma das condições acima for atendida, permita que a requisição continue.
  // Casos:
  // - Utilizador logado acedendo a uma rota protegida (ex: /)
  // - Utilizador não logado acedendo a uma rota pública (ex: /login)
  return NextResponse.next();
}

export const config = {
  // Executa o middleware em todas as rotas, exceto nas de API, ficheiros estáticos, imagens e favicon.
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
