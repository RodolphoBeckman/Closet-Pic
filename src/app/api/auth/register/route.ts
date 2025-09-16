
import { NextRequest, NextResponse } from 'next/server';
import { createRowInTable, getBaserowConfig, listRows } from '@/lib/baserow';
import bcrypt from 'bcryptjs';

// This function now specifically fetches from the 'Users' table.
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
        throw new Error('Falha ao buscar utilizadores do Baserow para verificação.');
    }
    const data = await response.json();
    return data.results;
}


async function createUser(rowData: Record<string, any>): Promise<any> {
    const { apiUrl, apiKey } = await getBaserowConfig();
    const usersTableId = process.env.ID_DA_TABELA_USERS_BASEROW;
    if (!usersTableId) {
        throw new Error('ID_DA_TABELA_USERS_BASEROW environment variable is not set.');
    }
    
    return createRowInTable(usersTableId, rowData);
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Nome, email e password são obrigatórios.' }, { status: 400 });
    }

    // Basic validation
    if (password.length < 6) {
        return NextResponse.json({ message: 'A password deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }
    
    // Ensure all required env vars are present before proceeding
    await getBaserowConfig();

    // Check if user already exists
    const users = await listUsers();
    const existingUser = users.find((u: any) => u.Email && u.Email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
        return NextResponse.json({ message: 'Já existe uma conta com este email.' }, { status: 409 });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Baserow 'Users' table
    const newUserRow = {
        'Name': name,
        'Email': email,
        'Password': hashedPassword,
        'Active': true, // Assuming you have an 'Active' field
    };

    await createUser(newUserRow);

    return NextResponse.json({ message: 'Utilizador registado com sucesso!' }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: error.message || 'An error occurred during registration.' }, { status: 500 });
  }
}
