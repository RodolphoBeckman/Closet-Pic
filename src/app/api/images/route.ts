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

  return row.SRC.map((file, index) => ({
    id: `${row['EU IA']}-${index}`, // Create a unique ID for each image
    src: file.url,
    alt: file.name,
    referencia: row['REFERÊNCIA'],
    marca: row['MARCA'],
    dia: String(row['DIA']),
    mes: row['MES'],
    ano: String(row['ANO']),
    dataRegistrada: row['DATA REGISTRADA'],
    category: 'default',
  }));
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
    
    // Each row from Baserow might contain multiple images. We need to flatten this.
    const allImages: StoredImage[] = rows.flatMap(transformBaserowRowToStoredImage);

    return NextResponse.json(allImages, { status: 200 });
  } catch (error: any) {
    console.error('Failed to fetch images from Baserow:', error);
    return NextResponse.json({ message: 'An error occurred while fetching images.', details: error.message }, { status: 500 });
  }
}
