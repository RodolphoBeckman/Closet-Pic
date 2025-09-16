import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

// Rotas que são acessíveis publicamente e não requerem autenticação.
const publicRoutes = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);
  
  // Obtém a sessão diretamente dos cookies.
  const session = await getSession();

  // REGRA 1: Se o utilizador está logado e tenta aceder a uma rota pública (ex: /login),
  // redireciona para a página principal.
  if (isPublicRoute && session?.email) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  // REGRA 2: Se o utilizador não está logado e tenta aceder a uma rota protegida,
  // redireciona para a página de login.
  if (!isPublicRoute && !session?.email) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Se nenhuma das condições acima for atendida, permita que a requisição continue.
  // Casos de uso permitidos:
  // - Utilizador logado a aceder a uma rota protegida (ex: /, /dashboard, etc.)
  // - Utilizador não logado a aceder a uma rota pública (ex: /login)
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
