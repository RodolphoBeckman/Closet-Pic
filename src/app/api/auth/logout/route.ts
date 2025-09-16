
import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    await deleteSession();
    return NextResponse.json({ message: 'Logout bem-sucedido' }, { status: 200 });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: 'Erro ao fazer logout' }, { status: 500 });
  }
}
