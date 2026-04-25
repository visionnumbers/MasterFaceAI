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

export type ShotRange = string;

export interface GenerationSettings {
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
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  styleName: string;
  ratio?: string;
  timestamp: number;
}
