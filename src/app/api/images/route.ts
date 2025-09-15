'use server';

import { NextRequest, NextResponse } from 'next/server';
import { listRows, getBaserowConfig } from '@/lib/baserow';
import type { BaserowRow, StoredImage } from '@/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

    let formattedDate = '-';
    // The date from baserow can come as an ISO string (e.g., '2024-07-28T18:10:00Z')
    // We need to parse it and then format it for Brazilian locale.
    if (row['DATA REGISTRADA']) {
        try {
            const date = parseISO(row['DATA REGISTRADA']);
            formattedDate = format(date, "dd 'de' MMMM 'de' yyyy HH:mm", { locale: ptBR });
        } catch (e) {
            console.warn(`Invalid date format for row ${row['EU IA']}: ${row['DATA REGISTRADA']}`);
            // Keep the original string if parsing fails, or use a default.
            formattedDate = row['DATA REGISTRADA']; 
        }
    }


    return {
      id: uniqueImageId,
      src: file.url,
      alt: file.name,
      referencia: row['REFERÊNCIA'],
      marca: row['MARCA'],
      dia: row['DIA'] ? String(row['DIA']) : undefined,
      mes: row['MES'],
      ano: row['ANO'] ? String(row['ANO']) : undefined,
      dataRegistrada: formattedDate,
      category: 'default', // Keep a default category
    };
  });
}


export async function GET(req: NextRequest) {
  try {
    await getBaserowConfig(); // Ensure env vars are loaded and validated
    const rows: BaserowRow[] = await listRows();
    
    // Each row from Baserow might contain multiple images. We use flatMap to flatten them into a single array.
    const allImages: StoredImage[] = rows.flatMap(transformBaserowRowToStoredImage);

    return NextResponse.json(allImages, { status: 200 });
  } catch (error: any) {
    console.error('Failed to fetch images from Baserow:', error);
    return NextResponse.json({ message: error.message || 'An error occurred while fetching images.' }, { status: 500 });
  }
}
