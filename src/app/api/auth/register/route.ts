import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '@/lib/baserow';
import { createSession } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Nome, email e senha são obrigatórios.' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ message: 'Um usuário com este email já existe.' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const uniqueId = `user_${new Date().getTime()}`;

    // Create user in Baserow
    const newUser = await createUser({
      'EU IA': uniqueId,
      name,
      email,
      password: hashedPassword,
      created_at: new Date().toISOString(),
    });

    // Create session for the new user
    await createSession({ name: newUser.name, email: newUser.email });

    return NextResponse.json({ message: 'Usuário registrado com sucesso!' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}
