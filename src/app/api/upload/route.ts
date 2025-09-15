'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createRow, uploadFile } from '@/lib/baserow';

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
    const baserowApiUrl = formData.get('baserowApiUrl') as string;
    const baserowApiKey = formData.get('baserowApiKey') as string;
    const baserowTableId = formData.get('baserowTableId') as string;

    if (!baserowApiKey || !baserowTableId || !baserowApiUrl) {
      return NextResponse.json({ message: 'Baserow API URL, Key or Table ID are missing.' }, { status: 400 });
    }

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
        files.map(file => uploadFile(file, baserowApiKey, baserowApiUrl))
    );
    
    // 2. Generate a unique ID for the new row (Baserow Primary Key)
    const uniqueId = `${new Date().getTime()}`;


    // 3. Create a new row in the Baserow table with the file metadata
    // IMPORTANT: The keys here must EXACTLY match the field names in your Baserow table.
    const rowData = {
      'EU IA': uniqueId, // This is the primary key field. Let's use a timestamp for uniqueness.
      'REFERÊNCIA': referencia,
      'MARCA': marca,
      'DIA': Number(dia),
      'MES': mes,
      'ANO': Number(ano),
      'DATA REGISTRADA': dataRegistrada,
      'SRC': uploadedFileMetadata.map(meta => ({ name: meta.name })), // Only send name for row creation
      'ALT': files.map(file => file.name).join(', '),
    };

    const newRow = await createRow(rowData, baserowTableId, baserowApiKey, baserowApiUrl);
    
    // Baserow API returns the created row. We'll enrich it with the full file URLs and a consistent ID.
    const responseWithUrls = {
        ...newRow,
        id: newRow['EU IA'], // Use the primary key value as the consistent ID for the frontend
        dataRegistrada: dataRegistrada, // Return the original ISO string
        src: uploadedFileMetadata.map(meta => ({ url: meta.url, name: meta.name })),
        referencia: newRow['REFERÊNCIA'],
        marca: newRow['MARCA'],
        dia: newRow['DIA'],
        mes: newRow['MES'],
        ano: newRow['ANO'],
    };

    return NextResponse.json(responseWithUrls, { status: 201 });

  } catch (error: any) {
    console.error('Upload failed:', error);
    return NextResponse.json({ message: 'An error occurred during upload.', details: error.message }, { status: 500 });
  }
}
