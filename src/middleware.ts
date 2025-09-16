import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

// 1. Especifique as rotas públicas
const publicPaths = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicPath = publicPaths.includes(path);

  // 2. Obtenha a sessão
  const session = await getSession();

  // 3. Lógica de redirecionamento
  if (!isPublicPath && !session) {
    // 3.1. Se a rota NÃO é pública e o usuário NÃO está logado, redirecione para o login
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  if (isPublicPath && session) {
    // 3.2. Se a rota É pública e o usuário ESTÁ logado, redirecione para a página principal
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 4. Se nenhuma das condições acima for atendida, permita o acesso
  return NextResponse.next();
}

// 5. Configure o matcher para executar o middleware em todas as rotas, EXCETO nas rotas de API e ficheiros estáticos.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|LOGO.png).*)'],
};
