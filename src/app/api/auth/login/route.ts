'use server';
import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, getBaserowConfig } from '@/lib/baserow';
import { createSession } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    await getBaserowConfig(); // Ensure env vars are loaded and validated
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email e senha são obrigatórios.' }, { status: 400 });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }
    
    // The password field name in Baserow is 'password' (lowercase)
    const storedPassword = user.password;

    // Check for user.password existence and type before accessing it
    if (!storedPassword || typeof storedPassword !== 'string') {
        return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    const passwordsMatch = await bcrypt.compare(password, storedPassword);

    if (!passwordsMatch) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    // Create session. The user name field is 'name'
    await createSession({ name: user.name, email: user.email });

    return NextResponse.json({ message: 'Login bem-sucedido!' }, { status: 200 });
  } catch (error: any) {
    console.error('Login server error:', error);
    return NextResponse.json({ message: error.message || 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}
