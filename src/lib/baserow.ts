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
  apiKey: string
): Promise<BaserowFileMetadata> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://api.baserow.io/api/user-files/upload-file/', {
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
 */
export async function createRow(
  rowData: Record<string, any>,
  tableId: string,
  apiKey: string
): Promise<any> {

  const response = await fetch(`https://api.baserow.io/api/database/rows/table/${tableId}/?user_field_names=true`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(rowData),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error('Baserow create row error:', errorBody);
    throw new Error(`Failed to create row in Baserow: ${response.statusText}`);
  }

  return response.json();
}