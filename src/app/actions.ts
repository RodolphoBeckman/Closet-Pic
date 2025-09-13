'use server';

import { categorizeImage } from '@/ai/flows/categorize-uploaded-images';

export async function getCategoryForImage(photoDataUri: string) {
  try {
    const result = await categorizeImage({ photoDataUri });
    return { category: result.category, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { category: null, error: `Failed to categorize image: ${errorMessage}` };
  }
}
