'use server';
import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/baserow';
import { createSession } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email e senha são obrigatórios.' }, { status: 400 });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }
    
    // Check for user.PASSWORD existence before accessing it
    if (!user.PASSWORD) {
        return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    const passwordsMatch = await bcrypt.compare(password, user.PASSWORD);

    if (!passwordsMatch) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    // Create session
    await createSession({ name: user.NAME, email: user.EMAIL });

    return NextResponse.json({ message: 'Login bem-sucedido!' }, { status: 200 });
  } catch (error) {
    console.error('Login server error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}
