import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

// Rotas que não exigem autenticação
const publicPaths = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicPath = publicPaths.includes(path);

  // Obter a sessão a partir do cookie
  const session = await getSession();

  // REGRA 1: Se o utilizador está logado e tenta aceder a uma página pública, redirecione para a home.
  if (isPublicPath && session) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  // REGRA 2: Se o utilizador não está logado e tenta aceder a uma página protegida, redirecione para o login.
  if (!isPublicPath && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Se nenhuma das condições acima for atendida, permita que a requisição continue.
  return NextResponse.next();
}

// Configuração do matcher para aplicar o middleware em todas as rotas,
// EXCETO nas que são explicitamente excluídas.
// É CRÍTICO excluir /api, /_next/static, /_next/image, e ficheiros de assets.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|LOGO.png|manifest.webmanifest).*)',
  ],
};
