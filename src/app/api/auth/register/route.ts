'use server';

import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, createRowInTable, getBaserowConfig } from '@/lib/baserow';
import bcrypt from 'bcryptjs';


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
    
    // Get users table ID securely
    const { usersTableId } = await getBaserowConfig();
     if (!usersTableId) {
      throw new Error("ID da tabela de usuários não configurado no ambiente.");
    }
    
    // IMPORTANT: Keys must match Baserow field names EXACTLY
    const newUserPayload = {
      'EU IA': uniqueId,
      'EMAIL': email,
      'PASSWORD': hashedPassword,
      'NAME': name,
      'CREATED_AT': now,
    };

    const newUser = await createRowInTable(usersTableId, newUserPayload);

    // Don't send the hashed password back to the client
    const safeUser = { id: newUser.id, name, email };

    return NextResponse.json({ message: 'Usuário criado com sucesso!', user: safeUser }, { status: 201 });
  } catch (error: any) {
    console.error('Registration server error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.', details: error.message }, { status: 500 });
  }
}
