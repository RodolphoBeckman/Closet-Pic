import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

const publicRoutes = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);
  
  const session = await getSession();

  // Se a rota for pública
  if (isPublicRoute) {
    // Se o usuário estiver logado e tentar acessar login/register, redireciona para a home
    if (session) {
      return NextResponse.redirect(new URL('/', req.nextUrl));
    }
    // Se não estiver logado, permite o acesso à rota pública
    return NextResponse.next();
  }

  // Se a rota for protegida
  // Se o usuário não estiver logado, redireciona para o login
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Se estiver logado, permite o acesso à rota protegida
  return NextResponse.next();
}

export const config = {
  // O middleware será executado em todas as rotas, EXCETO naquelas que começam com:
  // - api/ (rotas de API)
  // - _next/static (ficheiros estáticos)
  // - _next/image (ficheiros de otimização de imagem)
  // - favicon.ico (ícone do site)
  // - /LOGO.png (o seu logo)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|LOGO.png).*)'],
};