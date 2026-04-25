import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GenerationSettings } from "../types";
import { CATEGORIES, SHOT_RANGES } from "../constants";

// Quota exhaustion still requires checking Gemini API billing/rate-limit dashboard.
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing. Ensure it is set in Secrets.');
  }
  return new GoogleGenAI({ apiKey });
};

// --- PATCH: Retry Helper, Caching, and Locking ---
const faceAnalysisCache = new Map<string, string>();
let isGenerationInProgress = false;

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error.message || String(error);
    if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('Quota')) {
      throw new Error("Image generation limit reached. Please wait and try again, or check Gemini API billing/quota.");
    }
    throw error;
  }
}

function getImageKey(base64: string): string {
  const data = base64.split(',')[1] || base64;
  // Use length and samples from start/mid/end for a lightweight "hash"
  return `${data.length}_${data.slice(0, 100)}_${data.slice(data.length / 2, data.length / 2 + 100)}_${data.slice(-100)}`;
}
// --- END PATCH ---

export async function analyzeFace(base64Image: string): Promise<string> {
  const cacheKey = getImageKey(base64Image);
  if (faceAnalysisCache.has(cacheKey)) {
    console.log("Using cached face description.");
    return faceAnalysisCache.get(cacheKey)!;
  }

  return withRetry(async () => {
    const ai = getAI();
    const prompt = "Describe this person's facial features in extreme detail for a face-preservation image generation task. Include eye shape, nose structure, jawline, skin tone, unique marks, expression, and every subtle detail that makes this person unique. This description will be used to keep their identity identical in a new generation. Be clinical and descriptive.";
    
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite", // Patched to safer model
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType: "image/jpeg" } },
          { text: prompt }
        ]
      }
    });

    const description = result.text || "Human subject with identifiable features.";
    faceAnalysisCache.set(cacheKey, description);
    return description;
  });
}

export async function generateProfilePicture(
  base64Image: string,
  faceDescription: string,
  settings: GenerationSettings
): Promise<string> {
  if (isGenerationInProgress) {
    throw new Error("Generation already in progress. Please wait.");
  }

  isGenerationInProgress = true;
  try {
    return await withRetry(async () => {
      const ai = getAI();
      
      const allStyles = CATEGORIES.flatMap(c => c.styles);
      const style = allStyles.find(s => s.id === settings.styleId) || allStyles[0];
      const range = SHOT_RANGES.find(r => r.id === settings.shotRange) || SHOT_RANGES[0];

      const prompt = `
        TASK: Generate a professional studio portrait for the EXACT SAME PERSON shown in the reference image.
        
        IDENTITY (ABSOLUTE PRIORITY):
        - Facial Details to preserve: ${faceDescription}.
        - Do NOT change facial structure, ethnicity, or age.
        - Result must be recognizable as the identical person from the input.
        
        STYLE & TECHNICAL SPECS:
        - Theme Style: ${style.prompt}.
        - Shot Composition: ${range.name}.
        - Lighting Control: ${settings.lighting} lighting.
        - Background Type: ${settings.background} background.
        - Subject Pose: ${settings.pose}.
        - Expression/Mood: ${settings.mood}.
        
        TECHNICAL QUALITY: High-end professional photography, masterpiece quality.
        
        NEGATIVE PROMPT: ${settings.negativePrompt}. Avoid face morphing, distorted eyes, extra limbs, or low resolution. No change to identity.
      `;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",  //"gemini-2.5-flash-image",
        contents: {
          parts: [
            { inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType: "image/jpeg" } },
            { text: prompt }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: settings.ratio as any,
          }
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }

      throw new Error("Model success but no image was returned. Check safety filters.");
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  } finally {
    isGenerationInProgress = false;
  }
}
