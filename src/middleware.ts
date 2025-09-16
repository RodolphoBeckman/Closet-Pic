import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

// 1. Especifique as rotas públicas (acessíveis sem login)
const publicPaths = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicPath = publicPaths.includes(path);

  // 2. Obtenha a sessão a partir do cookie
  const session = await getSession();

  // 3. Lógica de redirecionamento
  
  // REGRA 1: Se o utilizador está logado e tenta aceder a uma página pública, redirecione para a home.
  if (isPublicPath && session) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  // REGRA 2: Se o utilizador não está logado e tenta aceder a uma página protegida, redirecione para o login.
  if (!isPublicPath && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 4. Se nenhuma das condições de redirecionamento for atendida, permita o acesso.
  return NextResponse.next();
}

// 5. Configure o matcher para executar o middleware em todas as rotas, 
// EXCETO nas rotas de API, ficheiros estáticos do Next.js, ficheiros de imagem e o favicon.
// Isto é CRÍTICO para evitar ciclos infinitos de verificação.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|LOGO.png|manifest.webmanifest).*)'],
};
