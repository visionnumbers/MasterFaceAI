import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GenerationSettings, GenerationResult } from "../types";
import { CATEGORIES, SHOT_RANGES, PRODUCT_SHOT_FEATURES, CREATOR_TOOLS, KIDS_ACTIVITIES } from "../constants";

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

export async function analyzeProductOnly(base64Image: string): Promise<string> {
  return withRetry(async () => {
    const ai = getAI();
    const prompt = `Analyze ONLY the product, clothing, jewelry, or accessory in this image.
COMPLETELY IGNORE any human face, facial features, or identity if a model is present.
Focus exclusively on:
1. PRODUCT TYPE: (e.g., dress, watch, necklace, hoodie, etc.)
2. MATERIAL & TEXTURE: (e.g., silk, leather, knit, gold, polished, matte)
3. COLOR & PATTERN: (e.g., midnight blue, floral, solid, metallic)
4. DESIGN ELEMENTS: (e.g., collar type, sleeve length, gemstone cut, strap style, branding)
5. DRAPE & LIGHTING: How the light hits the material and how it naturally falls/folds.

Provide a technical blueprint of the PRODUCT ONLY for precise replication.`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType: "image/jpeg" } },
          { text: prompt }
        ]
      }
    });

    return result.text || "High-quality product description.";
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

      if (settings.mode === 'text-to-image' && settings.textToImage?.prompt) {
        const hasFaceRef = !!settings.textToImage?.faceBase64;
        const hasStyleRef = !!settings.textToImage?.styleBase64;

        prompt = `
      TASK: Generate a NEW image according to the user prompt below.

      USER PROMPT:
      "${settings.textToImage.prompt}"

      ${hasFaceRef ? `
      === FACE REFERENCE / IDENTITY LOCK (HIGHEST PRIORITY) ===
      - The uploaded Face Reference is the ONLY identity source.
      - Face description: ${faceDescription}
      - The final person MUST be instantly recognizable as the Face Reference person.
      - Preserve identity markers: face shape, eye shape, eye color, nose, lips, jawline, chin, skin tone, mustache/beard, age range, expression, and unique marks.
      - Do NOT copy, blend, or borrow any face from the Style Reference.
      - Do NOT morph identity.
      ` : `
      === FACE REFERENCE ===
      - No Face Reference uploaded.
      - Do not perform face lock.
      - Generate the subject according to the user prompt and available style reference.
      `}

      ${hasStyleRef ? `
      === STYLE REFERENCE ===
      ${hasFaceRef ? `
      - Use the Style Reference ONLY as a non-identity style blueprint.
      - Apply only lighting, composition, background, pose, clothing style, camera angle, props, atmosphere, and overall aesthetic.
      - Ignore any person’s face, eyes, expression, ethnicity, age, or identity from the Style Reference.
      - The Style Reference is NOT an identity source.

      STYLE BLUEPRINT:
      ${styleDescription || 'Use the uploaded style reference as visual style guidance only.'}
      ` : `
      - Use the uploaded Style Reference as the main visual style and composition reference.
      - Since no Face Reference is uploaded, it is allowed to follow the general subject style, pose, lighting, background, and composition from the Style Reference.
      - Still follow the USER PROMPT as the main instruction.
      `}
      ` : `
      === STYLE REFERENCE ===
      - No Style Reference uploaded.
      `}

      STRICT PRIORITY ORDER:
      ${hasFaceRef ? `
      1. User prompt intent
      2. Face Reference identity
      3. Style Reference for non-face style only
      ` : hasStyleRef ? `
      1. User prompt intent
      2. Style Reference visual guidance
      3. General image quality
      ` : `
      1. User prompt intent
      2. General image quality
      `}

      OUTPUT REQUIREMENTS:
      - High-resolution professional image.
      - Natural integration.
      ${hasFaceRef ? '- Face must match Face Reference.' : ''}
      ${hasStyleRef ? '- Style, lighting, pose, background, and composition may follow the Style Reference.' : ''}
      ${hasFaceRef && hasStyleRef ? '- Do NOT recreate the person from the Style Reference.' : ''}

      NEGATIVE PROMPT:
      ${settings.negativePrompt || ''}
      ${hasFaceRef && hasStyleRef ? `
      - Do not copy the face from the Style Reference.
      - Do not keep any style-reference person identity.
      - Do not blend faces.
      - Do not morph identity.
      - Do not generate the style-reference person.
      ` : ''}
      - Avoid distorted face, broken hands, artifacts, or low-quality output.
      `;
      } else if (settings.mode === 'smart-edit' && settings.smartEdit && styleDescription) {
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
          High-quality professional portrait, accurate post, accurate scene style, sharp recognizable face.

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
          - Do NOT randomly change body proportions unless explicitly specified.

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

      const parts: any[] = [];

      if (settings.mode === 'text-to-image') {
        const faceRef = settings.textToImage?.faceBase64;
        const styleRef = settings.textToImage?.styleBase64;

        if (faceRef && faceRef.length > 0) {
          // CASE: Face exists
          // Send ONLY face image for identity lock.
          // If style also exists, style must be used only through styleDescription text.
          parts.push({
            inlineData: {
              data: faceRef.split(',')[1] || faceRef,
              mimeType: "image/jpeg"
            }
          });
        } else if (styleRef && styleRef.length > 0) {
          // CASE: No face image, only style reference exists
          // Here it is okay to send style image directly because there is no face lock requirement.
          parts.push({
            inlineData: {
              data: styleRef.split(',')[1] || styleRef,
              mimeType: "image/jpeg"
            }
          });
        }

        // CASE: Only text prompt
        // No image part is added.
      } else {
        // Other modes
        if (base64Image && base64Image.length > 0) {
          parts.push({
            inlineData: {
              data: base64Image.split(',')[1] || base64Image,
              mimeType: "image/jpeg"
            }
          });
        }
      }

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

export async function generateProductShot(
  base64Image: string,
  settings: GenerationSettings,
  personBase64?: string,
  faceDescription?: string,
  productDescription?: string
): Promise<GenerationResult> {
  if (isGenerationInProgress) {
    throw new Error("Generation already in progress. Please wait.");
  }

  isGenerationInProgress = true;
  try {
    return await withRetry(async () => {
      const ai = getAI();
      const productSettings = settings.productShot;

      if (!productSettings || !productSettings.activeFeature) {
        throw new Error('Product Shot feature not selected');
      }

      const feature = PRODUCT_SHOT_FEATURES.flatMap(c => c.items).find(i => i.id === productSettings.activeFeature);

      const prompt = `
        TASK: Perform a PROFESSIONAL PRODUCT PHOTOGRAPHY modification on the provided image(s).
        
        CORE OBJECTIVE:
        - Feature: ${feature?.label}
        - Setting/Value: ${productSettings.value}
        - Additional Instructions: ${productSettings.customPrompt || 'None'}

        ${productSettings.activeFeature === 'virtual-try-on' ? `
        VIRTUAL TRY-ON RULES (CRITICAL - EXTREMELY STRICT):
        1. IMAGE 1 = PERSON PHOTO. Use this analysis for IDENTITY LOCK: ${faceDescription || 'Original Identity'}.
        2. IMAGE 2 = PRODUCT PHOTO. Use this analysis for PRODUCT BLUEPRINT: ${productDescription || 'Original Product'}.
        
        FACE LOCK PROTOCOL:
        - Use 100% face from Image 1 ONLY.
        - NEVER copy, blend, or reference any face, facial features, or expression from Image 2, even if a model is wearing the product.
        - REPLACE any face in Image 2 with the exact face from Image 1.
        - The person must be 100% recognizable as the person from Image 1.
        
        PRODUCT INTEGRATION:
        - Apply the product from Image 2 onto the person from Image 1.
        - Ensure PERFECT fitting, realistic draping, and natural skin contact points.
        - Match lighting and perspective of Image 1 for a seamless look.
        
        ENVIRONMENT & POSE:
        - Generate a clean, professional studio background and natural pose.
        - DO NOT copy the background or pose from the product image.

        NEGATIVE PROMPT: Never copy the face from the product image. Never keep any model's face. Never blend faces. Do not use any facial features from Image 2. The face MUST come exclusively from Image 1.
        ` : ''}

        EXECUTION RULES:
        - PRESERVE IDENTITY: The main product, object, or person from the source must maintain its core characteristics unless the feature explicitly asks to change them.
        - COMMERCIAL QUALITY: Output must look like a high-end commercial photo, with clean lighting, sharp focus, and premium rendering.
        
        FEATURE SPECIFIC GUIDELINES:
        ${productSettings.activeFeature === 'lifestyle' ? '- Place the product naturally in the specified environment. If the setting implies human interaction (e.g., "Hands holding", "Worn"), render realistic human hands or a person correctly scaled and interacting with the product. Ensure realistic shadows, reflections, and contact points.' : ''}
        ${productSettings.activeFeature === 'jewelry' ? `- Use identity lock for jewelry: ${faceDescription || 'Original Identity'}. Show the jewelry from the product image worn by this person. Ensure realistic gemstone brilliance and metal reflections.` : ''}
        ${productSettings.activeFeature === 'logo-apparel' ? '- Apply the logo precisely to the apparel. Follow the fabric contours, lighting, and texture realistically.' : ''}
        ${productSettings.activeFeature === 'color-change' ? '- Change the product color to the specified value. Preserve all surface textures, shadows, and highlights.' : ''}
        ${productSettings.activeFeature === 'material-change' ? '- Transform the material surface to the target type (e.g., leather, metal). Ensure realistic material-specific reflections and grain.' : ''}
        ${productSettings.activeFeature === 'book-mockup' || productSettings.activeFeature === 'device-mockup' || productSettings.activeFeature === 'apparel-mockup' ? '- Use the provided image content as the design/cover/screen and map it perfectly onto the mockup object.' : ''}
        ${productSettings.activeFeature === 'clean-shot' ? '- Isolate the product on a clean, professional studio background. Add soft, realistic contact shadows.' : ''}

        QUALITY:
        - Cinematic studio lighting
        - Extremely high-detail textures
        - Zero Distortion
        - 8k resolution e-commerce style
      `;

      const parts: any[] = [];
      
      // Image 1: Person (if in Try-On mode) - User wants this as Image 1 for identity lock
      if (personBase64 && personBase64.length > 0) {
        parts.push({ inlineData: { data: personBase64.split(',')[1] || personBase64, mimeType: "image/jpeg" } });
      }
      
      // Image 2: Main Product (or Design)
      if (base64Image && base64Image.length > 0) {
        parts.push({ inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType: "image/jpeg" } });
      }

      parts.push({ text: prompt.trim() });

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: { parts },
        config: {
          imageConfig: { aspectRatio: settings.ratio as any },
          temperature: 0.1,
          topP: 0.8
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
  } catch (error: any) {
    console.error("Product Shot Gemini Error:", error);
    
    // Friendly error for safety filters
    const errorMessage = error?.message?.toLowerCase() || '';
    if (errorMessage.includes('safety') || errorMessage.includes('blocked') || errorMessage.includes('content policy') || errorMessage.includes('finish_reason_safety')) {
      throw new Error("Sorry, this product could not be generated due to AI content safety restrictions. Please try a different outfit or a less revealing product.");
    }
    
    throw error;
  } finally {
    isGenerationInProgress = false;
  }
}

export async function generateCreatorImage(
  settings: GenerationSettings,
  base64Image?: string
): Promise<GenerationResult> {
  const creatorSettings = settings.creator;
  const activeToolId = creatorSettings?.activeToolId || 'unknown';
  console.log(`[Creator] Generating ${settings.count || 1} image(s) for tool: ${activeToolId}`);

  if (isGenerationInProgress) {
    throw new Error("Generation already in progress. Please wait.");
  }

  isGenerationInProgress = true;
  try {
    return await withRetry(async () => {
      const ai = getAI();
      const creatorSettings = settings.creator;
      if (!creatorSettings || !creatorSettings.activeToolId) {
        throw new Error('Creator tool not selected');
      }

      const { activeToolId, inputs } = creatorSettings;
      
      const toolLabel = CREATOR_TOOLS.find(t => t.id === activeToolId)?.label || activeToolId;

      const prompt = `
        TASK: PROFESSIONAL ${toolLabel.toUpperCase()} ASSET GENERATION.
        
        CREATOR TYPE: ${toolLabel}
        ${inputs.mainText ? `MAIN TEXT/TOPIC: ${inputs.mainText}` : ''}
        ${inputs.brandName ? `BRAND/AUTHOR: ${inputs.brandName}` : ''}
        ${inputs.tagline ? `TAGLINE/SUBTEXT: ${inputs.tagline}` : ''}
        ${inputs.style ? `SELECTED STYLE: ${inputs.style}` : ''}
        ${inputs.description ? `DETAILS/AESTHETIC: ${inputs.description}` : ''}
        ${inputs.colors ? `COLOR PALETTE: ${inputs.colors}` : ''}
        ${creatorSettings.customPrompt ? `ADDITIONAL INSTRUCTIONS: ${creatorSettings.customPrompt}` : ''}

        EXECUTION RULES:
        - HIGH-END QUALITY: The result must look like it was created by a world-class professional designer/illustrator.
        - TYPOGRAPHY & DESIGN: If text is included, render it clearly and elegantly with balanced typography.
        - COMPOSITION: Professional layout, balanced elements, and intentional whitespace.
        - CLARITY: Sharp focus, clean vectors/renderings, and accurate color representation.
        ${base64Image ? '- REFERENCE: Use the provided IMAGE as a strong visual reference for style, composition, or subject.' : ''}

        SPECIAL RULES FOR ${activeToolId.toUpperCase()}:
        ${activeToolId === 'logo' ? '- Focus on iconic, memorable, and scalable logo design. Clean vectors, balanced proportions. Avoid generic clip-art looks.' : ''}
        ${activeToolId === 'illustrator' ? `- Focus on the ${inputs.style || 'artistic'} style. Consistent strokes, texture, and artistic soul across the whole frame.` : ''}
        ${activeToolId === 'youtube-thumb' ? '- High-energy, high-contrast, bold popping text, expressive and thumb-stopping visual hook.' : ''}
        ${activeToolId === 'sticker' || activeToolId === 'clip-art' ? '- Use a clean, isolated style. For stickers, include a professional white die-cut border/outline.' : ''}
        ${activeToolId === 'coloring-page' ? '- STRICTLY black and white line art only. No gray, no shadows, no color. Clean, sharp black outlines on a pure white background.' : ''}
        ${activeToolId === 'pattern' ? '- Create a stunning seamless pattern layout. Balanced repetition and beautiful flow.' : ''}

        QUALITY:
        - 8k Resolution
        - Professional Creative Suite rendering
        - Commercial grade results
      `;

      const parts = [];
      if (base64Image) {
        parts.push({ inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType: "image/jpeg" } });
      }
      parts.push({ text: prompt.trim() });

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: { parts },
        config: {
          imageConfig: { aspectRatio: settings.ratio as any },
          temperature: 0.2,
          topP: 0.8
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
  } catch (error: any) {
    console.error("Creator Gemini Error:", error);
    const errorMessage = error?.message?.toLowerCase() || '';
    if (errorMessage.includes('safety') || errorMessage.includes('blocked') || errorMessage.includes('content policy')) {
      throw new Error("Sorry, this creation could not be generated due to AI content safety restrictions. Please try a different prompt.");
    }
    throw error;
  } finally {
    isGenerationInProgress = false;
  }
}

export async function generateKidsZoneImage(
  settings: GenerationSettings,
  base64Image?: string
): Promise<GenerationResult> {
  const kidsSettings = settings.kidsZone;
  const activeActivityId = kidsSettings?.activeActivityId || 'unknown';
  console.log(`[KidsZone] Generating ${settings.count || 1} image(s) for activity: ${activeActivityId}`);

  if (isGenerationInProgress) {
    throw new Error("Generation already in progress. Please wait.");
  }

  isGenerationInProgress = true;
  try {
    return await withRetry(async () => {
      const ai = getAI();
      if (!kidsSettings || !kidsSettings.activeActivityId) {
        throw new Error('Kids activity not selected');
      }

      const { activeActivityId, inputs } = kidsSettings;
      const activityLabel = KIDS_ACTIVITIES.find(a => a.id === activeActivityId)?.label || activeActivityId;

      const prompt = `
        TASK: HIGH-QUALITY EDUCATIONAL KIDS ACTIVITY SHEET GENERATION.
        
        ACTIVITY TYPE: ${activityLabel}
        ${inputs.pageTitle ? `PAGE TITLE: ${inputs.pageTitle}` : ''}
        ${inputs.theme ? `THEME/IDEA: ${inputs.theme}` : ''}
        ${inputs.difficulty ? `DIFFICULTY: ${inputs.difficulty}` : ''}
        ${inputs.mazeType ? `MAZE TYPE: ${inputs.mazeType}` : ''}
        ${inputs.illustrationStyle ? `ILLUSTRATION STYLE: ${inputs.illustrationStyle}` : ''}
        ${inputs.primaryColor ? `PRIMARY COLOR: ${inputs.primaryColor}` : ''}
        ${inputs.secondaryColor ? `SECONDARY COLOR/ACCENT: ${inputs.secondaryColor}` : ''}
        ${inputs.numItems ? `NUMBER OF ITEMS/PAIRS: ${inputs.numItems}` : ''}
        ${inputs.language ? `LANGUAGE: ${inputs.language}` : ''}
        ${kidsSettings.customPrompt ? `ADDITIONAL INSTRUCTIONS: ${kidsSettings.customPrompt}` : ''}

        EXECUTION RULES:
        - TARGET AUDIENCE: Children aged 3 to 10 years old. Fun, friendly, and educational.
        - DESIGN STYLE: Bright, playful colors (unless it's a coloring page). Kid-friendly, legible typography.
        - COMPOSITION: Clean, organized layout ready for printing (A4 aspect). Elements should be well-spaced.
        - ARTWORK: Cute characters, clear icons, and recognizable objects.
        ${base64Image ? '- REFERENCE STYLE: Use the provided IMAGE as a strong visual reference for character design, color palette, or artistic style.' : ''}

        SPECIAL ACTIVITY RULES:
        ${activeActivityId === 'maze' ? '- Create a functional, solvable maze based on the theme. Clear entrance and exit.' : ''}
        ${activeActivityId === 'coloring-page' ? '- BOLD black outlines on a pure white background. NO gray, NO shadows. High contrast for easy coloring.' : ''}
        ${activeActivityId === 'spot-differences' ? '- Show two nearly identical panels side-by-side or top-bottom with exactly the requested number of subtle differences.' : ''}
        ${activeActivityId === 'shadow-matching' ? '- Display objects on one side and their solid black/gray silhouette shadows on the other.' : ''}
        ${activeActivityId === 'tracing-sheet' ? '- Large, clear letters or numbers with dotted or dashed lines for tracing. Include a guided line if possible.' : ''}
        ${activeActivityId === 'hidden-object' ? '- A dense, detailed illustration where the objects are cleverly integrated into the scene.' : ''}
        ${activeActivityId === 'math-puzzle' ? '- Use visual representations (objects/fruits) for numbers. Simple and intuitive.' : ''}
        ${activeActivityId === 'storybook' ? '- Full-page storybook illustration with room at the top or bottom for narrative text.' : ''}

        QUALITY:
        - 4k Sharp resolution
        - Professional educational materials standard
        - "Sparkle" quality - high engagement for kids
      `;

      const parts = [];
      if (base64Image) {
        parts.push({ inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType: "image/jpeg" } });
      }
      parts.push({ text: prompt.trim() });

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: { parts },
        config: {
          imageConfig: { aspectRatio: settings.ratio as any },
          temperature: 0.3,
          topP: 0.9
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

      throw new Error("Model success but no activity sheet returned. Check safety filters.");
    });
  } catch (error: any) {
    console.error("KidsZone Gemini Error:", error);
    const errorMessage = error?.message?.toLowerCase() || '';
    if (errorMessage.includes('safety') || errorMessage.includes('blocked') || errorMessage.includes('content policy')) {
      throw new Error("Sorry, this activity could not be generated due to AI content safety restrictions. Please try a different theme.");
    }
    throw error;
  } finally {
    isGenerationInProgress = false;
  }
}

export async function enhancePromptWithReferences(
  originalPrompt: string,
  faceBase64?: string,
  styleBase64?: string
): Promise<string> {
  try {
    const ai = getAI();

    const hasFaceRef = !!faceBase64;
    const hasStyleRef = !!styleBase64;

    let faceAnalysisText = "";
    let styleAnalysisText = "";

    if (hasFaceRef && faceBase64) {
      const faceAnalysis = await analyzeFace(faceBase64);
      faceAnalysisText = `\nFACE / IDENTITY REFERENCE:\n${faceAnalysis}`;
    }

    if (hasStyleRef && styleBase64) {
      const styleAnalysis = await analyzeStyleReference(styleBase64);
      styleAnalysisText = `\nSTYLE REFERENCE BLUEPRINT:\n${styleAnalysis}`;
    }

    const enhancementPrompt = `
      TASK: ENHANCE AND IMPROVE A USER'S IMAGE GENERATION PROMPT.

      ORIGINAL USER PROMPT:
      "${originalPrompt}"

      ${faceAnalysisText}
      ${styleAnalysisText}

      CONTEXT RULES:
      ${hasFaceRef ? `
      - A Face Reference is provided.
      - The enhanced prompt must treat the Face Reference as the ONLY identity source.
      - Preserve the subject's identity from the Face Reference.
      ` : `
      - No Face Reference is provided.
      - Do not add identity-lock language.
      `}

      ${hasStyleRef ? `
      - A Style Reference is provided.
      ${hasFaceRef ? `
      - Since a Face Reference is also provided, use the Style Reference ONLY for non-identity details:
        lighting, background, pose, clothing style, camera angle, props, atmosphere, and overall aesthetic.
      - Do NOT incorporate or describe the Style Reference person's face, identity, ethnicity, age, expression, eyes, nose, lips, or facial details.
      - Do NOT make the Style Reference person the subject.
      ` : `
      - Since no Face Reference is provided, use the Style Reference as visual guidance for style, composition, lighting, pose, background, and aesthetic.
      - Still keep the user's original prompt as the main instruction.
      `}
      ` : `
      - No Style Reference is provided.
      `}

      INSTRUCTIONS:
      1. Expand the original prompt into a detailed professional image-generation prompt.
      2. Preserve the original user intent. Do not change the subject unless the user asked.
      3. Add useful details about lighting, composition, camera framing, texture, mood, and quality.
      4. If Face Reference exists, include identity-lock wording clearly.
      5. If Style Reference exists with Face Reference, include style-reference wording only as non-face blueprint.
      6. If no Face Reference exists, do not mention exact identity lock.
      7. Output ONLY the enhanced prompt text. No explanation. No markdown.
      `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [{ role: "user", parts: [{ text: enhancementPrompt.trim() }] }]
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || originalPrompt;
  } catch (error) {
    console.error("Enhance Prompt Error:", error);
    return originalPrompt;
  }
}

export function clearFaceCache() {
  faceAnalysisCache.clear();
  console.log("Face analysis cache cleared.");
}

export function clearStyleCache() {
  styleAnalysisCache.clear();
  console.log("Style analysis cache cleared.");
}
