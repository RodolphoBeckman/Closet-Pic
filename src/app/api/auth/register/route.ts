'use server';

import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/baserow';
import bcrypt from 'bcryptjs';
import { createRowInTable } from '@/lib/baserow'; // Usaremos a função genérica

async function createUser(userData: Record<string, any>): Promise<any> {
    const usersTableId = process.env.ID_DA_TABELA_USERS_BASEROW;
    if (!usersTableId) {
        throw new Error("ID da tabela de usuários (ID_DA_TABELA_USERS_BASEROW) não configurado no ambiente.");
    }
    return createRowInTable(usersTableId, userData);
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

    if (password.length < 6) {
        return NextResponse.json({ message: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ message: 'Este email já está em uso.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uniqueId = `user_${new Date().getTime()}`;
    const now = new Date().toISOString();
    
    // IMPORTANT: Keys must match Baserow field names EXACTLY
    const newUser = await createUser({
      'EU IA': uniqueId,
      'EMAIL': email,
      'PASSWORD': hashedPassword,
      'NAME': name,
      'CREATED_AT': now,
    });

    return NextResponse.json({ message: 'Usuário criado com sucesso!', user: { id: newUser.id, name, email } }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.', details: error.message }, { status: 500 });
  }
}
