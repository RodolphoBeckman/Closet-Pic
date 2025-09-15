'use server';

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
    const apiUrl = process.env.URL_API_BASEROW;
    const apiKey = process.env.CHAVE_API_BASEROW;
    const tableId = process.env.ID_DA_TABELA_BASEROW;

    if (!apiKey || !tableId || !apiUrl) {
      throw new Error('As variáveis de ambiente do Baserow (URL_API_BASEROW, CHAVE_API_BASEROW, ID_DA_TABELA_BASEROW) não foram configuradas.');
    }

    return { apiUrl, apiKey, tableId };
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

/**
 * Creates a new row in a Baserow table.
 * The keys in rowData must be the exact names of the columns in your Baserow table.
 */
export async function createRow(
  rowData: Record<string, any>,
): Promise<any> {
  const { apiUrl, apiKey, tableId } = getBaserowConfig();
  // Use `user_field_names=true` to use the friendly names of the columns
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
    console.error('Baserow create row error:', errorBody.detail || errorBody);
    throw new Error(`Failed to create row in Baserow: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Lists all rows from a Baserow table.
 */
export async function listRows(): Promise<any> {
  const { apiUrl, apiKey, tableId } = getBaserowConfig();
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
