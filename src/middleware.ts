import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // A lógica de proteção de rota foi movida para um componente de nível superior
  // para evitar problemas com variáveis de ambiente no Edge Runtime.
  return NextResponse.next();
}

// Rotas em que o Middleware não deve ser executado
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
