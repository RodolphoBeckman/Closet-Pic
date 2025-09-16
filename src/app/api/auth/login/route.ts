
import { NextRequest, NextResponse } from 'next/server';
import { createRowInTable, getBaserowConfig, listRows } from '@/lib/baserow';
import { createSession } from '@/lib/session';
import bcrypt from 'bcryptjs';
import type { User } from '@/types';

// This function now specifically fetches from the 'Users' table.
// We assume a table named 'Users' exists with 'Email', 'Password', 'Name' fields.
async function listUsers(): Promise<any> {
    const { apiUrl, apiKey } = await getBaserowConfig();
    const usersTableId = process.env.ID_DA_TABELA_USERS_BASEROW;
    if (!usersTableId) {
        throw new Error('ID_DA_TABELA_USERS_BASEROW environment variable is not set.');
    }

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

    // Ensure all required env vars are present before proceeding
    await getBaserowConfig();

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
