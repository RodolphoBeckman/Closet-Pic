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
    
    const storedPassword = user.PASSWORD;
    // Robust check: Ensure the stored password is a non-empty string before comparing.
    // This handles cases where the field might be null, undefined, false, or an empty string.
    if (!storedPassword || typeof storedPassword !== 'string') {
        console.error(`Login attempt for ${email} failed: No valid password stored in database.`);
        return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    const passwordsMatch = await bcrypt.compare(password, storedPassword);

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
