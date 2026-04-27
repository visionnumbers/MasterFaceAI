import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GenerationSettings } from "../types";
import { CATEGORIES, SHOT_RANGES } from "../constants";

function getStyleBehavior(styleId: string): 'realistic' | 'soft-stylized' | 'hard-stylized' {
  const hardStylized = [
    'funko', 'bobblehead', 'chibi', 'lego', 'caricature'
  ];

  const softStylized = [
    'pixar', 'anime', 'ghibli', 'comic', 'cartoonify',
    'clay',
    'oil-painting', 'watercolor', 'pencil-sketch',
    'impressionist', 'surreal',
    'glitch', 'double-exposure', 'hologram'
  ];

  if (hardStylized.includes(styleId)) return 'hard-stylized';
  if (softStylized.includes(styleId)) return 'soft-stylized';

  return 'realistic';
}

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
      - realistic photo / cinematic portrait / anime / 3D / painting / sketch / comics etc.

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

export async function extractImagePrompt(base64Image: string): Promise<string> {
  return withRetry(async () => {
    const ai = getAI();
    const prompt = `
      Perform a deep visual analysis of this image and extract a high-quality, extremely detailed prompt that could be used to regenerate this exact image.
      Include the following details:
      1. SUBJECT: Detailed description of the person (or main subject), ethnicity, age, hair style, facial features, and expression.
      2. CLOTHING & ACCESSORIES: Materials, colors, and fit.
      3. POSE: Exact body and head position.
      4. STYLE & MEDIUM: Artistic medium (realistic photo, anime, digital art, etc.), camera settings (f-stop, lens mm), and film stock or digital sensor feel.
      5. LIGHTING: Source, color, intensity, and shadows.
      6. BACKGROUND: Detailed environment, textures, and depth of field.
      7. COLOR GRADING: Overall color palette and mood.
      8. COMPOSITION: Camera angle, framing, and rule of thirds.

      Format as a single, coherent, professional paragraph optimized for an AI image generator.
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

    return result.text || "A high-quality professional portrait.";
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
          ${activeAttribute === 'baby-face' ? '- Detail: Transform into a baby version of this person while locking core eyes/identity.' : ''}
          ${activeAttribute === 'rotation' ? '- Detail: Change orientation/viewing angle as specified, adjust 3D perspective.' : ''}
          ${activeAttribute === 'remove-person' || activeAttribute === 'remove-bg-people' ? '- Detail: Use realistic in-painting to clean the background after removal.' : ''}
          ${activeAttribute === 'makeup' || activeAttribute === 'teeth' || activeAttribute === 'eye-color' ? '- Detail: Micro-precision edit. Preserve skin texture. Only change target area.' : ''}
          
          EXECUTION:
          - Recreate the exact pose, composition, and quality of Image 1.
          - Apply the NEW value to the Target Attribute only.
          - Keep all other parts of the original scene (described in blueprint) as close as possible to the original.
          - The result must be a high-quality seamless edit where only the ${activeAttribute} is updated.
          
          OUTPUT: 8k professional quality, realistic, identical face, modified ${activeAttribute}.
          
          NEGATIVE PROMPT: ${settings.negativePrompt}. Do not change the face. Do not change other scene elements.
        `;
      } else if (settings.mode === 'extractor' && settings.extractor?.extractedPrompt) {
        prompt = `
          [PROMPT RE-GENERATION MODE]:
          Create a masterpiece image based on this specific prompt: ${settings.extractor.extractedPrompt}

          IDENTITY CONSTRAINT (IMAGE 1):
          - Description: ${faceDescription}
          - MANDATORY: Use Image 1 as the EXCLUSIVE identity source for the face. 
          - Preserve 100% of facial features, skin tone, and unique characteristics from Image 1.
          
          IMAGE GENERATION TASK:
          - Re-interpret the scene described in the prompt but with the person from Image 1.
          - Maintain the style, lighting, and composition described in: ${settings.extractor.extractedPrompt}
          
          OUTPUT: High-resolution masterpiece, cinematic quality, perfect identity lock.
          
          NEGATIVE PROMPT: ${settings.negativePrompt}. Avoid face morphing, distorted eyes, extra limbs, or low resolution.
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
       // Normal built-in styles mode
        const allStyles = CATEGORIES.flatMap(c => c.styles);
        const style = allStyles.find(s => s.id === settings.styleId) || allStyles[0];
        const styleBehavior = getStyleBehavior(style.id);
        const range = SHOT_RANGES.find(r => r.id === settings.shotRange) || SHOT_RANGES[0];

        prompt = `
          TASK: Generate a NEW high-quality portrait of the SAME PERSON from the reference image.

          IDENTITY (HIGHEST PRIORITY):
          ${styleBehavior !== 'hard-stylized' ? `
          - Facial Details: ${faceDescription}
          ` : `
          - Identity Reference: ${faceDescription}
          - Use this identity reference ONLY as loose likeness guidance.
          `}

          ${styleBehavior === 'realistic' ? `
          - Preserve exact face structure, eyes, nose, lips, jawline, skin tone, and recognizable identity.
          - The final output MUST clearly look like the same person.
          - Do NOT change identity under any condition.
          ` : ''}

          ${styleBehavior === 'soft-stylized' ? `
          - Preserve recognizable identity but adapt the face into the selected artistic style.
          - Keep face proportions mostly natural.
          - Maintain likeness, not strict photorealism.
          - Do NOT keep the face fully photorealistic if the selected style is artistic or animated.
          ` : ''}

          STYLE & VISUAL CONTROL:
          - Theme Style: ${style.prompt}
          - Style Behavior: ${styleBehavior}
          - Lighting: ${settings.lighting || 'Soft natural studio'}
          - Lighting Instruction: The lighting must clearly follow this setup, including direction, intensity, and color.
          - Background: ${settings.background || 'Studio plain'}
          - Background Instruction: The environment must clearly match this background setting with proper depth, lighting, and context.
          - Mood / Expression: ${settings.mood || 'Neutral professional'}
          - Mood Instruction: The facial expression and overall emotional tone must clearly match this mood.


          STYLE APPLICATION RULE:
          - Apply the selected style to the entire image, including face, body, clothing, background, lighting, and rendering.

          ${styleBehavior === 'realistic' ? `
          - Keep the face fully realistic and natural.
          - Preserve real-world face proportions and skin texture.
          - Do NOT stylize, simplify, cartoonify, or exaggerate facial features.
          ` : ''}

          ${styleBehavior === 'soft-stylized' ? `
          - Adapt the face into the selected style.
          - Keep proportions mostly realistic, but apply the artistic medium clearly.
          - The face should look painted/animated/illustrated when the selected style requires it.
          - Identity must remain recognizable through face shape, eye spacing, skin tone, and key features.
          ` : ''}

          ${styleBehavior === 'hard-stylized' ? `
          HARD STYLIZATION MODE (MANDATORY):

          - This is NOT a real human portrait.
          - This is a stylized character/figure representation.

          - Completely override realistic human appearance.
          - Transform the subject into a fully stylized character or toy figure.

          FACIAL TRANSFORMATION:
          - Simplify facial features.
          - Remove realistic skin texture.
          - Apply stylized geometry: rounded, flat, toy-like, exaggerated, or simplified forms.
          - Do NOT preserve detailed human facial realism.

          IDENTITY RULE:
          - Use identity ONLY as loose resemblance.
          - Preserve:
            → overall face shape
            → eye placement
            → hairstyle
            → mustache/beard pattern
            → skin-tone family
          - Do NOT preserve realistic pores, realistic skin texture, or photographic facial detail.

          STYLE CONSISTENCY:
          - Face and body MUST match the same stylized system.
          - No hybrid output allowed: never combine a realistic face with stylized body.
          - The full subject must match the selected style: ${style.prompt}

          FINAL OUTPUT MUST:
          - Look like a designed character or collectible figure, not a photograph.
          - Be fully stylized, not semi-realistic.
          ` : ''}

          POSE & BODY CONTROL:
          - Pose: ${settings.pose || 'Match natural pose from reference'}
          - Pose Instruction: The subject must clearly follow this pose naturally and realistically.
          - Maintain body proportions according to Style Behavior.
          - Do NOT randomly change pose unless explicitly specified.

          SUBJECT ADJUSTMENTS:
          - Age: ${settings.age || 'Keep original age'}
          - Body Type: ${settings.weight || 'Keep original body weight'}

          COMPOSITION:
          - Shot Type: ${range.name}
          - Shot Description: ${range.description}
          - Keep framing clean and professional.

          QUALITY:
          - High-quality output matching the selected style.
          - Sharp and clean facial rendering.

          ${styleBehavior === 'realistic' ? `
          - Clean natural skin texture.
          - Realistic professional lighting.
          ` : ''}

          ${styleBehavior === 'soft-stylized' ? `
          - Clean stylized rendering.
          - Consistent artistic texture across face and background.
          ` : ''}

          ${styleBehavior === 'hard-stylized' ? `
          - Clean character/figure rendering.
          - Consistent stylized material and proportions across face and body.
          ` : ''}

          NEGATIVE PROMPT:
          ${settings.negativePrompt}
          - No identity drift
          - No distorted eyes or broken face
          - No random pose change
          - No mixing of multiple styles

          ${styleBehavior === 'realistic' ? `
          - No cartoon face
          - No exaggerated proportions
          - No toy-like body
          ` : ''}

          ${styleBehavior === 'soft-stylized' ? `
          - No fully photorealistic face
          - No realistic face pasted onto stylized background
          - No mismatch between face style and scene style
          ` : ''}

          ${styleBehavior === 'hard-stylized' ? `
          - No realistic human face
          - No photorealistic skin
          - No realistic facial rendering
          - No detailed pores or skin texture
          - No high-detail human face
          - No semi-realistic hybrid output
          - No normal human body proportions
          - No realistic face pasted onto toy/cartoon body
          - No mismatch between face and body style
          ` : ''}
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