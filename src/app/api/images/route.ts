'use server';

import { NextRequest, NextResponse } from 'next/server';
import { listRows } from '@/lib/baserow';
import type { BaserowRow, StoredImage } from '@/types';

function transformBaserowRowToStoredImage(row: BaserowRow): StoredImage[] {
  // A single Baserow row can contain multiple images in the 'SRC' field.
  // We will create a StoredImage object for each file in the SRC field.
  if (!row.SRC || row.SRC.length === 0) {
    return [];
  }

  // A row might have multiple files in the 'SRC' field. Create an image object for each.
  return row.SRC.map((file, index) => {
    // Create a unique ID for each image by combining the Baserow row ID and the image index.
    const uniqueImageId = `${row['EU IA']}-${index}`;

    return {
      id: uniqueImageId,
      src: file.url,
      alt: file.name,
      referencia: row['REFERÊNCIA'],
      marca: row['MARCA'],
      dia: row['DIA'] ? String(row['DIA']) : undefined,
      mes: row['MES'],
      ano: row['ANO'] ? String(row['ANO']) : undefined,
      dataRegistrada: row['DATA REGISTRADA'],
      category: 'default', // Keep a default category
    };
  });
}


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apiUrl = searchParams.get('apiUrl');
  const apiKey = searchParams.get('apiKey');
  const tableId = searchParams.get('tableId');

  if (!apiKey || !tableId || !apiUrl) {
    return NextResponse.json({ message: 'Baserow API URL, Key or Table ID are missing.' }, { status: 400 });
  }

  try {
    const rows: BaserowRow[] = await listRows(tableId, apiKey, apiUrl);
    
    // Each row from Baserow might contain multiple images. We use flatMap to flatten them into a single array.
    const allImages: StoredImage[] = rows.flatMap(transformBaserowRowToStoredImage);

    return NextResponse.json(allImages, { status: 200 });
  } catch (error: any) {
    console.error('Failed to fetch images from Baserow:', error);
    return NextResponse.json({ message: 'An error occurred while fetching images.', details: error.message }, { status: 500 });
  }
}
