'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createRow, uploadFile } from '@/lib/baserow';
import type { StoredImage } from '@/types';

// Baserow has a file size limit of 5MB on the free plan. We set it a bit lower.
const MAX_FILE_SIZE_MB = 4.5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const referencia = formData.get('referencia') as string;
    const marca = formData.get('marca') as string;
    const dia = formData.get('dia') as string;
    const mes = formData.get('mes') as string;
    const ano = formData.get('ano') as string;
    const dataRegistrada = formData.get('dataRegistrada') as string;
   

    if (!files || files.length === 0) {
      return NextResponse.json({ message: 'No files to upload.' }, { status: 400 });
    }

    // Validate file sizes
    for (const file of files) {
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json({ message: `File ${file.name} exceeds the ${MAX_FILE_SIZE_MB}MB size limit.` }, { status: 413 });
        }
    }
    
    // 1. Upload all files to Baserow storage first
    const uploadedFileMetadata = await Promise.all(
        files.map(file => uploadFile(file))
    );
    
    // 2. Generate a unique ID for the new row (Baserow Primary Key)
    const uniqueId = `${new Date().getTime()}`;


    // 3. Create a new row in the Baserow table with the file metadata
    // IMPORTANT: The keys here must EXACTLY match the field names in your Baserow table.
    const rowData = {
      'EU IA': uniqueId,
      'REFERÊNCIA': referencia,
      'MARCA': marca,
      'DIA': Number(dia),
      'MES': mes,
      'ANO': Number(ano),
      'DATA REGISTRADA': dataRegistrada,
      'SRC': uploadedFileMetadata.map(meta => ({ name: meta.name })), // Only send name for row creation
      'ALT': files.map(file => file.name).join(', '),
    };

    const newRow = await createRow(rowData);
    
    // Baserow API returns the created row. We'll format it into our StoredImage type for the frontend.
    // Since one upload operation creates one row with possibly multiple images, we now return an array.
    const responseForFrontend: StoredImage[] = uploadedFileMetadata.map((meta, index) => ({
        id: `${newRow['EU IA']}-${index}`,
        src: meta.url, 
        alt: meta.name,
        referencia: newRow['REFERÊNCIA'],
        marca: newRow['MARCA'],
        dia: String(newRow['DIA']),
        mes: newRow['MES'],
        ano: String(newRow['ANO']),
        dataRegistrada: newRow['DATA REGISTRADA'],
        category: 'default' // default value
    }));


    return NextResponse.json(responseForFrontend, { status: 201 });

  } catch (error: any)
   {
    console.error('Upload failed:', error);
    // Be more specific about the error if it's a config issue
     if (error.message.includes('variáveis de ambiente')) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'An error occurred during upload.', details: error.message }, { status: 500 });
  }
}
