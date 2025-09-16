'use server';
require('dotenv').config();


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

export async function getBaserowConfig(isAuthOperation: boolean = false) {
    const apiUrl = process.env.URL_API_BASEROW;
    const apiKey = process.env.CHAVE_API_BASEROW;
    const tableId = process.env.ID_DA_TABELA_BASEROW;
    const usersTableId = process.env.ID_DA_TABELA_USERS_BASEROW;

    if (!apiUrl || !apiKey) {
      throw new Error('As variáveis de ambiente URL_API_BASEROW ou CHAVE_API_BASEROW não foram configuradas.');
    }
    
    if (isAuthOperation) {
        if (!usersTableId) {
            throw new Error('A variável de ambiente ID_DA_TABELA_USERS_BASEROW não foi configurada. Esta variável é necessária para login e registo.');
        }
    } else {
        if (!tableId) {
            throw new Error('A variável de ambiente ID_DA_TABELA_BASEROW não foi configurada. Esta variável é necessária para as operações de imagem.');
        }
    }

    return { apiUrl, apiKey, tableId: tableId!, usersTableId: usersTableId };
}


/**
 * Uploads a file to Baserow user files.
 */
export async function uploadFile(
  file: File,
): Promise<BaserowFileMetadata> {
  const { apiUrl, apiKey } = await getBaserowConfig();
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
    const { apiUrl, apiKey } = await getBaserowConfig(true); // Assume auth context for generic creation might need user table
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
        throw new Error(`Failed to create row in Baserow table ${tableId}: ${errorBody.detail?.error || response.statusText}`);
    }

    return response.json();
}


/**
 * Creates a new row in the main images table.
 */
export async function createRow(
  rowData: Record<string, any>,
): Promise<any> {
  const { tableId } = await getBaserowConfig();
  return createRowInTable(tableId, rowData);
}

/**
 * Lists all rows from the main images table.
 */
export async function listRows(): Promise<any> {
  const { apiUrl, apiKey, tableId } = await getBaserowConfig();
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
