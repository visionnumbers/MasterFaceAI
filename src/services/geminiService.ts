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
const styleAnalysisCache = new Map<string, string>();
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
    const prompt = `Describe ONLY the facial features of this person in extreme clinical detail. 
DO NOT mention clothing, background, lighting, shirt, collar, or any non-face element.
Focus exclusively on: face shape, forehead, eyebrows, eyes (shape, color, size, eyelashes), nose (shape, nostrils), lips (upper/lower), mouth, jawline, chin, cheekbones, skin tone, skin texture, age indicators, mustache/beard if any, expression, and any unique marks or features.
Be precise and technical. This will be used for 100% identity lock.`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType: "image/jpeg" } },
          { text: prompt }
        ]
      }
    });

    const description = result.text || "Human subject with identifiable facial features.";
    faceAnalysisCache.set(cacheKey, description);
    return description;
  });
}

export async function analyzeStyleReference(base64Image: string): Promise<string> {
  const cacheKey = getImageKey(base64Image);
  if (styleAnalysisCache.has(cacheKey)) {
    console.log("Using cached style description.");
    return styleAnalysisCache.get(cacheKey)!;
  }

  return withRetry(async () => {
    const ai = getAI();
    const prompt = `
      Analyze this image as a STRICT NON-FACE STYLE BLUEPRINT for portrait generation.

      Describe ONLY non-identity visual details:

      1. ARTISTIC MEDIUM:
      - realistic photo / cinematic portrait / anime / 3D / painting / sketch etc.

      2. POSE & BODY LANGUAGE:
      - seated/standing
      - body angle
      - head angle
      - shoulder angle
      - torso posture
      - leg position
      - overall pose mood

      3. HAND & OBJECT POSITION:
      - exact hand positions
      - fingers placement
      - any visible object held by the subject
      - object position relative to face/body
      - do not assume objects if not visible

      4. ATMOSPHERIC EFFECTS:
      - smoke, fog, mist, dust, rain, sparks, glow, motion blur, etc. only if visible
      - density, direction, softness, color, and placement

      5. CLOTHING & ACCESSORIES:
      - outfit type, color, fabric, fit
      - accessories, jewelry, shoes if visible

      6. LIGHTING:
      - light direction
      - light color
      - intensity
      - contrast
      - rim light / neon / softbox / natural light if visible

      7. BACKGROUND & ENVIRONMENT:
      - location type
      - props
      - furniture
      - wall/curtain/room texture
      - depth and background mood

      8. CAMERA & COMPOSITION:
      - crop
      - framing
      - angle
      - distance
      - full body / half body / close-up
      - subject placement

      DO NOT describe face, eyes, nose, lips, ethnicity, age, identity, or facial expression.
      Return a detailed reusable blueprint for recreating everything EXCEPT identity and face.
      `; 
          
    
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType: "image/jpeg" } },
          { text: prompt }
        ]
      }
    });

    const description = result.text || "Professional studio style.";
    styleAnalysisCache.set(cacheKey, description);
    return description;
  });
}

export interface GenerationResult {
  url: string;
  prompt: string;
}

export async function generateProfilePicture(
  base64Image: string,
  faceDescription: string,
  settings: GenerationSettings,
  styleBase64?: string,
  styleDescription?: string
): Promise<GenerationResult> {
  if (isGenerationInProgress) {
    throw new Error("Generation already in progress. Please wait.");
  }

  isGenerationInProgress = true;
  try {
    return await withRetry(async () => {
      const ai = getAI();
      
      let prompt = "";

      if (settings.mode === 'smart-edit' && settings.smartEdit && styleDescription) {
        const { activeAttribute, value } = settings.smartEdit;
        prompt = `
          [SMART EDIT COMMAND]: Modify Image 1 based on the instruction while locking identity.
          
          ORIGINAL SCENE BLUEPRINT:
          ${styleDescription}
          
          IDENTITY LOCK (IMAGE 1):
          - Description: ${faceDescription}
          - THIS IS THE ONLY FACE. Preserve 100% facial identity from Image 1. 
          - Do NOT change facial structure or expression unless explicitly asked.
          
          MODIFICATION TASK:
          - Target Attribute: ${activeAttribute?.toUpperCase()}
          - New Value: ${value}
          
          EXECUTION:
          - Recreate the exact pose, composition, and quality of Image 1.
          - Apply the NEW value to the Target Attribute only.
          - Keep all other parts of the original scene (described in blueprint) as close as possible to the original.
          - The result must be a high-quality seamless edit where only the ${activeAttribute} is updated.
          
          OUTPUT: 8k professional quality, realistic, identical face, modified ${activeAttribute}.
          
          NEGATIVE PROMPT: ${settings.negativePrompt}. Do not change the face. Do not change other scene elements.
        `;
      } else if (settings.mode === 'reference' && styleDescription) {
        prompt = `
          TASK: Generate a NEW original portrait of the SAME PERSON from Image 1.

          IDENTITY SOURCE:
          - Image 1 is the ONLY identity source.
          - Facial Details to preserve: ${faceDescription}
          - Preserve Image 1 person's face shape, eyes, nose, lips, jawline, skin tone, age range, and recognizable identity.
          - Final output must clearly look like Image 1.

          STYLE / POSE / SCENE BLUEPRINT:
          ${styleDescription}

          STRICT STYLE MATCHING RULES:
          - Match the pose, body angle, hand position, visible objects, clothing, lighting, background, environment, camera angle, crop, and overall artistic medium from the blueprint as closely as possible.
          - If the blueprint contains a visible object, include that object naturally.
          - If the blueprint contains atmospheric effects such as smoke, fog, mist, rain, sparks, glow, or motion blur, include them naturally.
          - If no object or atmospheric effect is described, do not invent one.
          - Do NOT copy the face, eyes, expression, or identity from the style reference.

          IMPORTANT:
          - The style reference is NOT an identity source.
          - The generated person must be Image 1 person only.
          - Style, pose, clothes, background, lighting, and composition can follow the blueprint.
          - Identity cannot change.

          OUTPUT:
          High-quality professional portrait, accurate pose, accurate scene style, sharp recognizable face.

          NEGATIVE PROMPT:
          ${settings.negativePrompt}. No style-reference face. No different identity. No missing visible objects from blueprint. No missing visible atmospheric effects from blueprint. No face blending. No identity morphing.
          `;
      } else {
        // Normal built-in styles mode (unchanged)
        const allStyles = CATEGORIES.flatMap(c => c.styles);
        const style = allStyles.find(s => s.id === settings.styleId) || allStyles[0];
        const range = SHOT_RANGES.find(r => r.id === settings.shotRange) || SHOT_RANGES[0];

        prompt = `
        TASK: Generate a NEW high-quality portrait of the SAME PERSON from the reference image.

        IDENTITY (HIGHEST PRIORITY):
        - Facial Details: ${faceDescription}
        - Preserve exact face structure, eyes, nose, lips, jawline, skin tone, and recognizable identity.
        - The final output MUST clearly look like the same person.
        - Do NOT change identity under any condition.

        STYLE & VISUAL CONTROL:
        - Theme Style: ${style.prompt}
        - Lighting: ${settings.lighting || 'Soft natural studio'}
        - Background: ${settings.background || 'Studio plain'}
        - Mood: ${settings.mood || 'Professional'}

        POSE & BODY CONTROL (IMPORTANT):
        - Pose: ${settings.pose || 'Match natural pose from reference'}
        - Maintain natural body proportions and posture
        - Do NOT randomly change pose unless explicitly specified

        SUBJECT ADJUSTMENTS:
        - Age: ${settings.age || 'Keep original age'}
        - Body Type: ${settings.weight || 'Keep original body weight'}

        COMPOSITION:
        - Shot Type: ${range.name}
        - Keep framing clean and professional

        QUALITY:
        - Realistic, sharp focus, professional photography
        - Clean skin texture, natural lighting

        NEGATIVE PROMPT:
        ${settings.negativePrompt}
        - No identity change
        - No face morphing
        - No distorted eyes or face
        - No unnatural pose change
        `;
      }

      const parts: any[] = [
        { inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType: "image/jpeg" } }
      ];

      // IMPORTANT:
      // Do NOT pass styleBase64 into image generation.
      // Passing the style reference image makes Gemini copy its original face/identity.
      // We only use styleDescription text as scene/style blueprint.

      parts.push({ text: prompt });

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: { parts },
        config: {
          imageConfig: { aspectRatio: settings.ratio as any },
          temperature: 0.2,
          topP: 0.7
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return {
              url: `data:image/png;base64,${part.inlineData.data}`,
              prompt: prompt.trim()
            };
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