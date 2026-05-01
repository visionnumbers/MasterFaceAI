export interface Style {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  styles: Style[];
}

export type Gender = 'male' | 'female' | 'unisex';

export type GenerationMode = 'built-in' | 'reference' | 'smart-edit' | 'extractor' | 'product-shot' | 'creator' | 'kids-zone' | 'text-to-image';

export type ShotRange = string;

export interface TextToImageSettings {
  prompt: string;
  faceReference?: File | null;
  styleReference?: File | null;
  faceBase64?: string;
  styleBase64?: string;
}

export interface KidsActivitySettings {
  activeActivityId: string | null;
  inputs: {
    pageTitle?: string;
    theme?: string;
    difficulty?: string;
    mazeType?: string;
    illustrationStyle?: string;
    primaryColor?: string;
    secondaryColor?: string;
    numItems?: string;
    language?: string;
    [key: string]: string | undefined;
  };
  customPrompt: string;
}

export interface KidsActivity {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  fields: {
    id: string;
    label: string;
    type: 'text' | 'select' | 'textarea';
    placeholder?: string;
    options?: string[];
  }[];
}

export interface CreatorSettings {
  activeToolId: string | null;
  inputs: {
    mainText?: string;
    tagline?: string;
    brandName?: string;
    description?: string;
    colors?: string;
    style?: string; // For Illustrators Creator
  };
  customPrompt: string;
}

export interface CreatorTool {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  placeholders: {
    mainText?: string;
    tagline?: string;
    brandName?: string;
    description?: string;
    colors?: string;
  };
}

export interface SmartEditSettings {
  activeAttribute: 
    | 'background' | 'clothing' | 'pose' | 'lighting' | 'expression' 
    | 'hair' | 'accessories' | 'age' | 'style' | 'facial-hair'
    | 'scene' | 'rotation' | 'makeup' | 'teeth' | 'eye-color' 
    | 'eyes-open' | 'remove-person' | 'multi-clothing' 
    | 'remove-bg-people' | 'baby-face' | 'tattoo' | 'bald' | null;
  value: string;
}

export interface ExtractorSettings {
  extractedPrompt: string;
  isExtracted: boolean;
}

export interface ProductShotSettings {
  activeFeature: string | null;
  value: string;
  customPrompt: string;
  tryOnPersonBase64?: string;
}

export interface ProductShotFeature {
  id: string;
  label: string;
  description?: string;
  icon: string;
  color: string;
  presets: string[];
}

export interface ProductShotCategory {
  category: string;
  items: ProductShotFeature[];
}

export interface GenerationSettings {
  mode: GenerationMode;
  gender: Gender;
  shotRange: string;
  styleId: string;
  count: number;
  weight: string;
  age: string;
  lighting: string;
  background: string;
  pose: string;
  mood: string;
  ratio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  quality: 'standard' | 'high' | 'ultra';
  negativePrompt: string;
  smartEdit?: SmartEditSettings;
  extractor?: ExtractorSettings;
  productShot?: ProductShotSettings;
  creator?: CreatorSettings;
  kidsZone?: KidsActivitySettings;
  textToImage?: TextToImageSettings;
}

export interface GenerationResult {
  url: string;
  prompt: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  styleName: string;
  ratio?: string;
  timestamp: number;
}
