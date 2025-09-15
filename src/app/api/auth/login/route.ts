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
    
    // The password from Baserow might be undefined if the column is empty
    const storedPassword = user.password;
    if(!storedPassword) {
        return NextResponse.json({ message: 'Conta não possui senha configurada.' }, { status: 401 });
    }

    const passwordsMatch = await bcrypt.compare(password, storedPassword);

    if (!passwordsMatch) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    // Create session
    await createSession({ name: user.name, email: user.email });

    return NextResponse.json({ message: 'Login bem-sucedido!' }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}
