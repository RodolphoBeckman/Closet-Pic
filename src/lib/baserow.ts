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

/**
 * Uploads a file to Baserow user files.
 */
export async function uploadFile(
  file: File,
  apiKey: string,
  apiUrl: string
): Promise<BaserowFileMetadata> {
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
  tableId: string,
  apiKey: string,
  apiUrl: string
): Promise<any> {
  // Use `user_field_names=false` to use the internal field_x names, which are stable.
  // We'll pass the exact column names as keys in the body, which Baserow supports.
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
