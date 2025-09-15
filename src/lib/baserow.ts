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
    const usersTableId = process.env.ID_DA_TABELA_USERS_BASEROW;


    if (!apiKey || !apiUrl) {
      throw new Error('As variáveis de ambiente do Baserow (NEXT_PUBLIC_URL_API_BASEROW, NEXT_PUBLIC_CHAVE_API_BASEROW) não foram configuradas.');
    }

    if(!tableId && !usersTableId) {
       throw new Error('Pelo menos uma variável de ID de tabela do Baserow (NEXT_PUBLIC_ID_DA_TABELA_BASEROW ou ID_DA_TABELA_USERS_BASEROW) deve ser configurada.');
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
    // Use an exact (but case-insensitive) filter for the email
    url.searchParams.append('filter__field_EMAIL__equal', email);
    url.searchParams.append('size', '1');

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Token ${apiKey}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            // If the table or view is not found, Baserow might return a 404.
            // If the filter is bad, it might be a 400.
            // We'll log the error and return null as the user was not found.
            const errorBody = await response.text();
            console.error(`Baserow API error when finding user by email (${email}): ${response.status} ${response.statusText}`, errorBody);
            return null;
        }

        const data = await response.json();

        // If results array exists and has at least one item, return the first one.
        if (data.results && data.results.length > 0) {
            return data.results[0] as BaserowUser;
        }

        // If no results, the user doesn't exist.
        return null;

    } catch (error) {
        console.error('Network or other error in findUserByEmail:', error);
        return null;
    }
}
