// src/ai/genkit.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    // Ortam değişkeninde GEMINI_API_KEY veya GOOGLE_API_KEY varsa
    // googleAI() bunu otomatik kullanıyor.
    googleAI(),
    // İstersen açıkça da verebilirsin:
    // googleAI({ apiKey: process.env.GEMINI_API_KEY }),
  ],

  // Varsayılan model (metin + görsel destekli, hızlı ve ucuz)
  model: googleAI.model('gemini-2.5-flash'),
});
