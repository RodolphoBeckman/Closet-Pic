'use server';
import type { BaserowUser } from '@/types';

interface BaserowFileMetadata {
    url: string;
    thumbnails: object;
    name: string;
    size: number;
    mime_type: string;
    is_image: boolean;
    image_width: number;
    image_height: number;
    uploaded_at: string;
}

const getBaserowConfig = () => {
    const apiUrl = process.env.NEXT_PUBLIC_URL_API_BASEROW;
    const apiKey = process.env.NEXT_PUBLIC_CHAVE_API_BASEROW;
    const tableId = process.env.NEXT_PUBLIC_ID_DA_TABELA_BASEROW;
    const usersTableId = process.env.NEXT_PUBLIC_ID_DA_TABELA_USERS_BASEROW;


    if (!apiKey || !apiUrl) {
      throw new Error('As variáveis de ambiente do Baserow (NEXT_PUBLIC_URL_API_BASEROW, NEXT_PUBLIC_CHAVE_API_BASEROW) não foram configuradas.');
    }

    if(!tableId && !usersTableId) {
       throw new Error('Pelo menos uma variável de ID de tabela do Baserow (NEXT_PUBLIC_ID_DA_TABELA_BASEROW ou NEXT_PUBLIC_ID_DA_TABELA_USERS_BASEROW) deve ser configurada.');
    }

    return { apiUrl, apiKey, tableId, usersTableId };
}


/**
 * Uploads a file to Baserow user files.
 */
export async function uploadFile(
  file: File,
): Promise<BaserowFileMetadata> {
  const { apiUrl, apiKey } = getBaserowConfig();
  const formData = new FormData();
  formData.append('file', file);
  
  const uploadUrl = new URL('/api/user-files/upload-file/', apiUrl).toString();

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error('Baserow upload error:', errorBody);
    throw new Error(`Failed to upload file to Baserow: ${response.statusText}`);
  }

  return response.json();
}

// Generic function to create a row in any table
export async function createRowInTable(tableId: string, rowData: Record<string, any>): Promise<any> {
    const { apiUrl, apiKey } = getBaserowConfig();
    const createRowUrl = new URL(`/api/database/rows/table/${tableId}/?user_field_names=true`, apiUrl).toString();

    const response = await fetch(createRowUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(rowData),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error(`Baserow create row error in table ${tableId}:`, errorBody.detail || errorBody);
        throw new Error(`Failed to create row in Baserow table ${tableId}: ${response.statusText}`);
    }

    return response.json();
}


/**
 * Creates a new row in the main images table.
 */
export async function createRow(
  rowData: Record<string, any>,
): Promise<any> {
  const { tableId } = getBaserowConfig();
  if(!tableId) throw new Error("ID da tabela de imagens não configurado.");
  return createRowInTable(tableId, rowData);
}

/**
 * Lists all rows from the main images table.
 */
export async function listRows(): Promise<any> {
  const { apiUrl, apiKey, tableId } = getBaserowConfig();
  if(!tableId) throw new Error("ID da tabela de imagens não configurado.");
  const listRowsUrl = new URL(`/api/database/rows/table/${tableId}/?user_field_names=true`, apiUrl).toString();

  const response = await fetch(listRowsUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${apiKey}`,
    },
    cache: 'no-store', // Disable caching to ensure fresh data
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error('Baserow list rows error:', errorBody);
    // Be more descriptive with the error for easier debugging
    if (response.status === 404) {
         throw new Error(`Tabela Baserow não encontrada. Verifique se o ID_DA_TABELA_BASEROW (${tableId}) está correto.`);
    }
     if (response.status === 401) {
         throw new Error(`Acesso não autorizado ao Baserow. Verifique se a CHAVE_API_BASEROW está correta.`);
    }
    throw new Error(`Falha ao buscar linhas do Baserow: ${response.statusText}`);
  }
  const data = await response.json();
  return data.results; // The rows are in the 'results' property
}


// --- User Authentication Functions ---

/**
 * Finds a user by their email address.
 */
export async function findUserByEmail(email: string): Promise<BaserowUser | null> {
    const { apiUrl, apiKey, usersTableId } = getBaserowConfig();
    if (!usersTableId) throw new Error("ID da tabela de usuários não configurado.");
    
    const url = new URL(`/api/database/rows/table/${usersTableId}/`, apiUrl);
    url.searchParams.append('user_field_names', 'true');
    // Add a filter to find the user by email (case-insensitive)
    url.searchParams.append('filter__field_EMAIL__contains_i', email);
    // Add a filter to ensure the email field is not empty
    url.searchParams.append('filter__field_EMAIL__is_not_empty', 'true');
    url.searchParams.append('size', '1'); // We only expect one user

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Authorization': `Token ${apiKey}`,
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error('Baserow find user error:', errorBody);
        throw new Error(`Failed to find user by email: ${response.statusText}`);
    }

    const data = await response.json();
    // Since 'contains_i' can match parts of emails, we need to double-check
    // for an exact match, but case-insensitively.
    const matchingUser = data.results.find(
      (user: BaserowUser) => user.EMAIL && user.EMAIL.toLowerCase() === email.toLowerCase()
    );

    if (matchingUser) {
      return matchingUser;
    }
    
    return null;
}
