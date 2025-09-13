// categorize-uploaded-images.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for categorizing uploaded images using AI.
 *
 * - categorizeImage - An exported function that takes an image data URI as input and returns a category for the image.
 * - CategorizeImageInput - The input type for the categorizeImage function.
 * - CategorizeImageOutput - The output type for the categorizeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type CategorizeImageInput = z.infer<typeof CategorizeImageInputSchema>;

const CategorizeImageOutputSchema = z.object({
  category: z.string().describe('The category of the image.'),
});

export type CategorizeImageOutput = z.infer<typeof CategorizeImageOutputSchema>;

export async function categorizeImage(input: CategorizeImageInput): Promise<CategorizeImageOutput> {
  return categorizeImageFlow(input);
}

const categorizeImagePrompt = ai.definePrompt({
  name: 'categorizeImagePrompt',
  input: {schema: CategorizeImageInputSchema},
  output: {schema: CategorizeImageOutputSchema},
  prompt: `You are an AI that categorizes images.  Given an image, determine the most appropriate category for it.  Respond only with the name of the category.

Image: {{media url=photoDataUri}}`,
});

const categorizeImageFlow = ai.defineFlow(
  {
    name: 'categorizeImageFlow',
    inputSchema: CategorizeImageInputSchema,
    outputSchema: CategorizeImageOutputSchema,
  },
  async input => {
    const {output} = await categorizeImagePrompt(input);
    return output!;
  }
);
