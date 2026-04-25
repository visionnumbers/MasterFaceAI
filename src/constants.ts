import { Category } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'professional',
    name: 'Professional & Studio',
    icon: 'Briefcase',
    styles: [
      { id: 'corporate', name: 'Corporate Headshot', description: 'Clean, professional LinkedIn style', prompt: 'a professional corporate headshot, clean background, sharp focus, business attire, high-end LinkedIn profile picture' },
      { id: 'rembrandt', name: 'Rembrandt Lighting', description: 'Classic dramatic studio lighting', prompt: 'Rembrandt lighting portrait, dramatic shadows, moody studio atmosphere, professional photography' },
      { id: 'luxury', name: 'Luxury Brand Shoot', description: 'Vogue-style high fashion portrait', prompt: 'luxury brand editorial portrait, high fashion photography, expensive aesthetic, professional studio lighting' },
      { id: 'executive', name: 'Executive Portrait', description: 'Powerful and confident look', prompt: 'executive portrait, powerful confident expression, high-end office background, authoritative professional style' },
      { id: 'minimalist', name: 'Minimalist Studio', description: 'Clean white background', prompt: 'minimalist studio portrait, solid white background, high-key lighting, clean sleek aesthetic' },
      { id: 'soft-glamour', name: 'Soft Glamour', description: 'Flattering soft light', prompt: 'soft glamour portrait, flattering diffused lighting, professional beauty photography, radiant skin' },
      { id: 'black-tie', name: 'Black Tie Formal', description: 'Tuxedo or evening gown', prompt: 'formal black tie portrait, elegant tuxedo or evening gown, red carpet aesthetic, sophisticated high-end gala atmosphere' },
      { id: 'tech-founder', name: 'Tech Founder', description: 'Casual but visionary', prompt: 'tech founder visionary portrait, modern startup office background, casual visionary aesthetic, Steve Jobs or Elon Musk vibe' },
      { id: 'architect', name: 'Architect / Designer', description: 'Sharp and architectural', prompt: 'architect designer portrait, sharp lines, structural background, creative professional aesthetic, minimalist and precise' },
      { id: 'speaker', name: 'Public Speaker', description: 'Dynamic stage presence', prompt: 'public speaker portrait, on stage with microphone, professional stage lighting, bokeh audience background, dynamic and charismatic' },
      { id: 'news-anchor', name: 'News Anchor', description: 'Trustworthy and poised', prompt: 'news anchor portrait, television studio background, professional broadcasting lighting, sharp business attire, trustworthy poised expression' },
      { id: 'creative-lead', name: 'Creative Lead', description: 'Modern and edgy professional', prompt: 'creative lead portrait, modern agency background, edgy professional style, stylish workwear, innovative vibe' },
      { id: 'banker', name: 'Banker / Finance', description: 'Polished finance professional', prompt: 'wealth management executive portrait, expensive business suit, financial district skyscraper interior background, polished high-end aesthetic' },
      { id: 'attorney', name: 'Legal Counsel', description: 'Sharp and authoritative', prompt: 'legal counsel attorney portrait, library with law books background, sharp professional business attire, authoritative poised expression' },
      { id: 'medical', name: 'Medical Specialist', description: 'Clean clinical professional', prompt: 'medical specialist portrait, professional medical attire, clean minimalist clinic background, trustworthy and caring expression' },
      { id: 'real-estate', name: 'Real Estate Agent', description: 'Friendly and approachable', prompt: 'luxury real estate agent portrait, beautiful home interior background, friendly approachable smile, polished professional attire' }
    ]
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    icon: 'Camera',
    styles: [
      { id: 'hollywood', name: 'Hollywood Glamour', description: 'Golden age of cinema', prompt: 'classic Hollywood glamour, vintage film style, dramatic cinematic lighting, movie star aesthetic' },
      { id: 'film-noir', name: 'Film Noir', description: 'Gritty black and white', prompt: 'film noir style, high contrast black and white, dramatic shadows, moody detective movie aesthetic' },
      { id: 'cyberpunk', name: 'Cyberpunk Neon', description: 'Futuristic city lights', prompt: 'cyberpunk neon portrait, futuristic city lights, blue and pink lighting, sci-fi aesthetic, wet pavement reflection' },
      { id: 'blockbuster', name: 'Blockbuster Poster', description: 'Epic movie poster vibe', prompt: 'epic movie poster portrait, blockbuster action movie aesthetic, dramatic orange and teal color grading' },
      { id: 'oscar', name: 'Oscar Winning Lighting', description: 'Perfect cinematic glow', prompt: 'Oscar winning cinematography lighting, professional film set aesthetic, masterpiece quality, atmospheric' },
      { id: 'scifi-horror', name: 'Sci-Fi Horror', description: 'Tense and atmospheric', prompt: 'sci-fi horror cinematic portrait, emergency red lighting, shadowy corridor background, tense atmosphere, Alien or Prometheus movie aesthetic' },
      { id: 'period-drama', name: 'Period Drama', description: 'Historical epic feel', prompt: 'period drama cinematic portrait, historical epic aesthetic, warm candle-lit atmosphere, detailed period costume, Bridgeton or Downton Abbey vibe' },
      { id: 'fantasy-epic', name: 'Fantasy Epic', description: 'Lord of the Rings style', prompt: 'fantasy epic cinematic portrait, Lord of the Rings aesthetic, dramatic natural lighting, majestic mountain background' }
    ]
  },
  {
    id: 'artistic',
    name: 'Artistic',
    icon: 'Palette',
    styles: [
      { id: 'oil-painting', name: 'Oil Painting', description: 'Classic heavy brushstrokes', prompt: 'a masterpiece oil painting, visible brushstrokes, textured canvas, classical art style' },
      { id: 'watercolor', name: 'Watercolor', description: 'Soft and ethereal', prompt: 'soft watercolor painting, ethereal bleeds, paper texture, delicate artistic style' },
      { id: 'pencil-sketch', name: 'Pencil Sketch', description: 'Detailed graphite drawing', prompt: 'detailed pencil sketch, graphite shading, hand-drawn artistic style, charcoal accents' },
      { id: 'impressionist', name: 'Impressionist', description: 'Monet-style light and color', prompt: 'impressionist painting style, vibrant colors, soft light, dabs of paint, Claude Monet aesthetic' },
      { id: 'surreal', name: 'Surreal', description: 'Dream-like artistic vision', prompt: 'surreal art portrait, dream-like atmosphere, imaginative elements, abstract artistic expression' }
    ]
  },
  {
    id: 'cultural',
    name: 'Cultural & Regional',
    icon: 'Globe',
    styles: [
      { id: 'bengali-bridal', name: 'Bengali Classical', description: 'Rich traditional Bengali style', prompt: 'traditional Bengali classical portrait, rich red saree, gold jewelry, bindi, heritage cultural aesthetic, elegant' },
      { id: 'indian-festive', name: 'North Indian Festive', description: 'Celebratory Kurta/Sherwani', prompt: 'North Indian festive portrait, elegant Sherwani or Kurta, Diwali celebration vibe, warm glowing lights' },
      { id: 'mughal-royal', name: 'Mughal Royal', description: 'Ancient Indian royalty', prompt: 'Mughal royal portrait, intricate ancient Indian embroidery, majestic heritage aesthetic, historical palace background' },
      { id: 'west-bengal', name: 'Durga Puja Vibe', description: 'Kolkata heritage style', prompt: 'Durga Puja festive portrait, Kolkata street background, traditional attire, dhunuchi dance atmosphere, vibrant festive energy' },
      { id: 'south-indian', name: 'South Indian Temple', description: 'Traditional silk and gold', prompt: 'traditional South Indian portrait, Kanjeevaram silk saree, heavy temple gold jewelry, jasmine flowers, temple background' },
      { id: 'punjabi', name: 'Punjabi Heritage', description: 'Vibrant and energetic', prompt: 'vibrant Punjabi cultural portrait, elegant Phulkari embroidery or Sherwani, royal turban, celebratory energetic atmosphere' },
      { id: 'rajasthani', name: 'Rajasthani Royal', description: 'Ornate desert heritage', prompt: 'Rajasthani heritage portrait, ornate traditional jewelry, colorful turban or lehenga, desert palace background' },
      { id: 'korean-drama', name: 'Korean Drama', description: 'Soft K-Drama aesthetic', prompt: 'Korean drama aesthetic portrait, soft pastel colors, youthful clean look, Hallyu wave style' },
      { id: 'japanese-zen', name: 'Japanese Aesthetic', description: 'Sophisticated Zen style', prompt: 'Japanese Zen aesthetic portrait, minimalist Kimono style, cherry blossom background, peaceful sophisticated atmosphere' },
      { id: 'arabic-royalty', name: 'Arabic Royalty', description: 'Majestic desert elegance', prompt: 'Arabic royalty portrait, majestic Thobe or Abaya with gold embroidery, desert sunset background, elegant traditional aesthetic' }
    ]
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    icon: 'Smile',
    styles: [
      { id: 'office', name: 'Office Workspace', description: 'Modern professional at work', prompt: 'modern office workspace lifestyle portrait, blurred office background, natural professional at work aesthetic' },
      { id: 'travel', name: 'Travel Adventure', description: 'Outdoors explorer vibe', prompt: 'travel adventure portrait, exotic outdoor location background, explorer aesthetic, natural sunlight' },
      { id: 'fitness', name: 'Fitness / Gym', description: 'Athletic and strong', prompt: 'fitness gym portrait, athletic aesthetic, professional lighting, workout environment' },
      { id: 'urban-street', name: 'Urban Street', description: 'Cool city lifestyle', prompt: 'urban street style portrait, city background, hypebeast aesthetic, candid lifestyle' }
    ]
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    icon: 'Zap',
    styles: [
      { id: 'angelic', name: 'Angelic Glow', description: 'Divine and ethereal', prompt: 'angelic glow portrait, divine light, wings, ethereal white aesthetic, heavenly atmosphere' },
      { id: 'mythological', name: 'God / Goddess', description: 'Powerful ancient deity', prompt: 'mythological god or goddess portrait, epic power, ancient divine aesthetic, gold and cosmic elements' },
      { id: 'cybernetic', name: 'Cybernetic', description: 'Half-human, half-machine', prompt: 'cybernetic enhancement portrait, robot parts, glowing circuits, high-tech sci-fi aesthetic' },
      { id: 'steampunk', name: 'Steampunk', description: 'Victorian industrial', prompt: 'steampunk portrait, victorian industrial aesthetic, gears, brass goggles, leather elements' }
    ]
  },
  {
    id: 'animated',
    name: 'Fun & Animated',
    icon: 'Ghost',
    styles: [
      { id: 'pixar', name: 'Pixar 3D', description: 'Modern 3D animation', prompt: '3D animated character style, Pixar aesthetic, large expressive eyes, detailed 3D render' },
      { id: 'anime', name: 'Anime', description: 'Japanese animation style', prompt: 'anime style portrait, vibrant colors, hand-drawn aesthetic, high-quality Japanese animation' },
      { id: 'ghibli', name: 'Ghibli Style', description: 'Whimsical and hand-painted', prompt: 'Studio Ghibli animation style, whimsical hand-painted aesthetic, peaceful nature background' },
      { id: 'comic', name: 'Comic Book', description: 'Bold ink and colors', prompt: 'comic book style portrait, bold ink lines, Ben-Day dots, superhero aesthetic' }
    ]
  },
  {
    id: 'social-media',
    name: 'Social Media',
    icon: 'Grid',
    styles: [
      { id: 'influencer', name: 'Influencer Aesthetic', description: 'Bright and airy lifestyle', prompt: 'influencer lifestyle aesthetic, bright airy lighting, trendy modern background, Instagram viral style' },
      { id: 'selfie', name: 'Premium Selfie', description: 'Natural but polished look', prompt: 'premium high-end selfie portrait, natural window lighting, polished modern aesthetic, front-facing flattering' },
      { id: 'youtube', name: 'YouTube Thumbnail', description: 'Vibrant and engaging', prompt: 'YouTube thumbnail style portrait, vibrant popping colors, high energy expression, engaging thumb stop aesthetic' }
    ]
  },
  {
    id: 'experimental',
    name: 'Experimental',
    icon: 'Zap',
    styles: [
      { id: 'glitch', name: 'Glitch Art', description: 'Digital distortion effect', prompt: 'glitch art portrait, digital distortion, chromatic aberration, futuristic experimental aesthetic' },
      { id: 'double-exposure', name: 'Double Exposure', description: 'Two images in one', prompt: 'double exposure portrait, artistic silhouette merging with nature landscapes, ethereal creative aesthetic' },
      { id: 'hologram', name: 'Hologram', description: 'Glowing blue projection', prompt: 'futuristic hologram projection portrait, glowing blue light, scan lines, ethereal digital aesthetic' }
    ]
  },
  {
    id: 'photography',
    name: 'Photography Effects',
    icon: 'Aperture',
    styles: [
      { id: 'bokeh', name: 'Bokeh Background', description: 'Blurry light circles', prompt: 'extreme bokeh background portrait, shallow depth of field, blurred city lights, professional photography' },
      { id: 'hdr', name: 'HDR Dramatic', description: 'High dynamic range', prompt: 'dramatic HDR portrait, high contrast, surreal detail, intense colors' },
      { id: 'golden-hour', name: 'Golden Hour', description: 'Perfect sunset light', prompt: 'golden hour portrait, warm sunset lighting, sun flare, magical natural light' },
      { id: 'long-exposure', name: 'Long Exposure', description: 'Light trails and motion', prompt: 'long exposure creative portrait, light painting, motion blur, artistic photography' },
      { id: 'infrared', name: 'Infrared Vision', description: 'Surreal white foliage', prompt: 'infrared photography portrait, surreal white foliage, high contrast, monochromatic dream-like atmosphere' },
      { id: 'vintage-film', name: '35mm Vintage Film', description: 'Nostalgic grain and tone', prompt: '35mm vintage film photography, grain, light leaks, nostalgic color grading, authentic retro vibe' },
      { id: 'glam-glow', name: 'Glamour Glow', description: 'Soft radiant skin', prompt: 'glamour glow photography effect, soft focus highlights, radiant skin, high-end commercial beauty lighting' },
      { id: 'editorial-shadow', name: 'Editorial Shadow', description: 'Moody geometric shadows', prompt: 'editorial shadow photography, dramatic geometric light patterns on face, high fashion moody aesthetic, sharp contrast' }
    ]
  }
];

export const SHOT_RANGES = [
  { id: 'extreme-headshot', name: 'Extreme Close-Up', description: 'Face only' },
  { id: 'classic-headshot', name: 'Classic Headshot', description: 'Head & neck' },
  { id: 'professional-bust', name: 'Professional Bust', description: 'Head + shoulders' },
  { id: 'medium-close-up', name: 'Medium Close-up', description: 'Chest up' },
  { id: 'waist-up', name: 'Waist Up Shot', description: 'Mid-section up' },
  { id: 'three-quarter', name: 'Three-Quarter View', description: 'Knees up' },
  { id: 'full-body', name: 'Full Body Portrait', description: 'Head to toe' },
  { id: 'cowboy-shot', name: 'Cowboy Shot', description: 'Mid-thigh up' },
  { id: 'environmental', name: 'Environmental Portrait', description: 'Subject in setting' }
];

export const LIGHTING_OPTIONS = [
  'Soft natural', 'Dramatic studio', 'Cinematic', 'Golden hour', 'Moody', 
  'Neon glow', 'High-key bright', 'Rembrandt', 'Backlit silhouette',
  'Volumetric god rays', 'Softbox studio', 'Ring light', 'Fairy lights', 'Custom'
];
export const BACKGROUND_OPTIONS = [
  'Studio plain', 'Subtle gradient', 'Environmental', 'Abstract', 'Transparent', 
  'Modern office', 'Lush garden', 'Urban street', 'Library bookshelf', 'Art gallery', 
  'Minimalist white', 'Cyberpunk city', 'Cozy cafe', 'Mountain peaks', 'Beach sunset', 
  'Industrial loft', 'Futuristic server room', 'Japanese garden', 'Custom'
];
export const MOOD_OPTIONS = [
  'Neutral professional', 'Confident', 'Warm smile', 'Serious', 'Creative', 
  'Thoughtful', 'Energetic', 'Mysterious', 'Friendly approachable', 'Vibrant',
  'Playful', 'Brave', 'Reserved', 'Intense', 'Ethereal', 'Custom'
];
export const WEIGHT_OPTIONS = [
  'Keep original', 'Slimmer', 'Athletic/Toned', 'Muscular', 'Average', 'More healthy', 'Custom'
];
export const AGE_OPTIONS = [
  'Keep original', 'Current age', 'Younger (Teen)', 'Young adult (20s)', 'Mature (40s)', 'Senior (60s+)', 'Custom'
];
export const RATIO_OPTIONS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
export const POSE_OPTIONS = [
  'Keep original pose', 
  'Confident Standing Pose',
  '🪑 Relaxed Sitting Position',
  '🚶 Dynamic Walking Motion',
  '🏃 Athletic Running Pose',
  '🤸 Energetic Jumping Action',
  '🙌 Celebratory Hands Up',
  '🙅 Confident Crossed Arms',
  '👋 Friendly Waving Gesture',
  '👉 Direct Pointing Gesture',
  '🤔 Thoughtful Contemplation',
  'Custom'
];
export const BATCH_COUNTS: (1 | 2)[] = [1, 2];
