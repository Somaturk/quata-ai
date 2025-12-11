// src/ai/analyzeProductImage.ts
'use server';
/**
 * @fileOverview An AI flow for analyzing product images.
 *
 * - analyzeProductImage - A function that handles the product analysis from an image.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type {
  AnalyzeProductImageInput,
  AnalyzeProductImageOutput,
} from '@/lib/types';

const AnalyzedProductSchema = z.object({
  name: z.string().describe('The name of the product.'),
  description: z
    .string()
    .describe('A detailed description of the product, written in Turkish.'),
  brand: z
    .string()
    .optional()
    .describe('The brand of the product, if identifiable.'),
  purchasePrice: z
    .number()
    .optional()
    .describe(
      'The estimated purchase price of the product. If not available, estimate or omit.'
    ),
  sellingPrice: z
    .number()
    .describe(
      'The estimated selling price of the product. This is a required field.'
    ),
  vatRate: z
    .number()
    .optional()
    .describe(
      'The Value Added Tax (VAT) rate for the product as a percentage, e.g., 20 for 20%. Default to 20 if not specified.'
    ),
  currency: z
    .enum(['USD', 'TRY'])
    .optional()
    .describe(
      "The currency of the prices. If you see a '$' symbol, use 'USD'. If you see a '₺' symbol or no symbol at all, assume 'TRY'."
    ),
});

const AnalyzeProductImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of one or more products, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

const AnalyzeProductImageOutputSchema = z.array(AnalyzedProductSchema);

const productAnalysisPrompt = ai.definePrompt({
  name: 'productAnalysisPrompt',
  input: { schema: AnalyzeProductImageInputSchema },
  output: { schema: AnalyzeProductImageOutputSchema },

  // 🔑 Burada artık güncel model ID'yi kullanıyoruz:
  // Genkit dokümantasyonu format olarak 'googleai/gemini-2.5-flash' diyor.
  model: 'googleai/gemini-2.5-flash',

  prompt: `You are an expert product analyst. Analyze the provided image to identify all products within it. 
For each product, extract the following details:
- Product Name (name)
- Description (description). This description MUST be in Turkish.
- Brand (brand)
- Selling Price (sellingPrice)
- Purchase Price (purchasePrice)
- VAT Rate (vatRate) as a percentage. Default to 20 if not visible or applicable.
- Currency (currency)

If a detail like brand or price is not clearly visible, make a reasonable estimation based on the product's appearance. The selling price is mandatory. The purchase price can be estimated as 70% of the selling price if not available.
If you see a '$' symbol, set the currency to 'USD'. If you see '₺' or no currency symbol, assume 'TRY'.

Return the information as a JSON array of objects, even if there is only one product.

Image to analyze: {{media url=photoDataUri}}`,
});

const analyzeProductImageFlow = ai.defineFlow(
  {
    name: 'analyzeProductImageFlow',
    inputSchema: AnalyzeProductImageInputSchema,
    outputSchema: AnalyzeProductImageOutputSchema,
  },
  async (input) => {
    const { output } = await productAnalysisPrompt(input);
    return output || [];
  }
);

export async function analyzeProductImage(
  input: AnalyzeProductImageInput
): Promise<AnalyzeProductImageOutput> {
  return analyzeProductImageFlow(input);
}
