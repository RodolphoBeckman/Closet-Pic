
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session';

// 1. Especifique as rotas públicas (não protegidas)
const publicRoutes = ['/login', '/register'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 2. Verifique se a rota é pública
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Obtenha a sessão do cookie
  const cookie = req.cookies.get('session')?.value;
  const session = await decrypt(cookie);

  // 4. Lógica de redirecionamento
  
  // Se o usuário está logado e tentando acessar uma página pública,
  // redirecione-o para a página inicial.
  if (session?.email && isPublicRoute) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  // Se o usuário não está logado e tentando acessar uma rota que NÃO é pública,
  // redirecione-o para a página de login.
  if (!session?.email && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // 5. Se nenhuma das condições acima for atendida, permita que a requisição continue.
  return NextResponse.next();
}

// Rotas nas quais o Middleware deve ser executado.
// Isso evita que ele seja executado em rotas de API, arquivos estáticos, etc.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
