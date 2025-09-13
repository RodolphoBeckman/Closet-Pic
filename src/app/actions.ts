'use server';

import { categorizeImage } from '@/ai/flows/categorize-uploaded-images';

export async function getCategoryForImage(photoDataUri: string) {
  try {
    const result = await categorizeImage({ photoDataUri });
    return { ...result, dia: null, mes: null, ano: null, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { 
      category: null,
      referencia: null,
      marca: null,
      dia: null,
      mes: null,
      ano: null, 
      error: `Failed to categorize image: ${errorMessage}` 
    };
  }
}
