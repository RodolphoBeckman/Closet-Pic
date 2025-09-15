
'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

// Define as rotas que não precisam de autenticação
const publicRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get('session')?.value;
  const session = await decrypt(cookie);

  const isPublicRoute = publicRoutes.includes(pathname);

  // Se o usuário está tentando acessar uma rota pública mas já está logado,
  // redireciona para a página principal.
  if (isPublicRoute && session?.email) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  // Se o usuário está tentando acessar uma rota protegida (qualquer uma que não seja pública)
  // e não tem uma sessão, redireciona para a página de login.
  if (!isPublicRoute && !session?.email) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // Se nenhuma das condições acima for atendida, permite que a requisição continue.
  return NextResponse.next();
}

// O middleware só será executado nas rotas que correspondem a este matcher.
// Ele agora exclui explicitamente as rotas de API, assets do Next.js e arquivos públicos.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|LOGO.png|manifest.webmanifest).*)'],
};
