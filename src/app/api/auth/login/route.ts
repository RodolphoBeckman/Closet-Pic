
import { NextRequest, NextResponse } from 'next/server';
import { getBaserowConfig } from '@/lib/baserow';
import { createSession } from '@/lib/session';
import bcrypt from 'bcryptjs';
import type { User } from '@/types';

// This function now specifically fetches from the 'Users' table.
async function listUsers(): Promise<any> {
    // Pass true to indicate this is an auth operation
    const { apiUrl, apiKey, usersTableId } = await getBaserowConfig(true);

    const listRowsUrl = new URL(`/api/database/rows/table/${usersTableId}/?user_field_names=true`, apiUrl).toString();

    const response = await fetch(listRowsUrl, {
        method: 'GET',
        headers: { 'Authorization': `Token ${apiKey}` },
        cache: 'no-store',
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Tabela de utilizadores não encontrada. Verifique se o ID_DA_TABELA_USERS_BASEROW (${usersTableId}) está correto.`);
        }
        if (response.status === 401) {
            throw new Error('Acesso não autorizado ao Baserow. Verifique a sua CHAVE_API_BASEROW.');
        }
        const errorBody = await response.json();
        console.error("Baserow list users error:", errorBody);
        throw new Error('Falha ao buscar utilizadores do Baserow.');
    }
    const data = await response.json();
    return data.results;
}


export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email e password são obrigatórios.' }, { status: 400 });
    }

    const users = await listUsers();

    const userRow = users.find((u: any) => u.Email && u.Email.toLowerCase() === email.toLowerCase());

    if (!userRow) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    // The stored password should be a hash.
    const passwordMatch = await bcrypt.compare(password, userRow.Password);
    
    if (!passwordMatch) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }
    
    const user: User = {
        id: userRow.id.toString(),
        name: userRow.Name,
        email: userRow.Email,
    };

    // Create the session
    await createSession(user);

    return NextResponse.json({ message: 'Login bem-sucedido!' }, { status: 200 });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ message: error.message || 'An error occurred during login.' }, { status: 500 });
  }
}
