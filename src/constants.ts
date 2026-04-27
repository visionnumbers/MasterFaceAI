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
      { id: 'bengali-bridal', name: 'Bengali Classical', description: 'Rich traditional Bengali style', prompt: 'traditional Bengali classical portrait, heritage cultural aesthetic, elegant' },
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
      {
        id: 'office',
        name: 'Office Workspace',
        description: 'Professional at work',
        prompt: 'modern office workspace portrait, clean desk setup, soft indoor lighting, natural professional working environment, subtle depth blur'
      },
      {
        id: 'startup-founder',
        name: 'Startup Founder',
        description: 'Modern business lifestyle',
        prompt: 'startup founder portrait, modern office or co-working space, confident relaxed posture, minimal setup, premium entrepreneurial aesthetic'
      },
      {
        id: 'work-from-home',
        name: 'Work From Home',
        description: 'Casual productivity',
        prompt: 'work from home lifestyle portrait, cozy desk setup, laptop workspace, natural window light, relaxed but focused vibe'
      },
      {
        id: 'travel',
        name: 'Travel Adventure',
        description: 'Explorer outdoors',
        prompt: 'travel adventure portrait, scenic outdoor location, mountains/beach/landmark background, natural sunlight, explorer aesthetic'
      },
      {
        id: 'luxury-travel',
        name: 'Luxury Travel',
        description: 'Premium lifestyle',
        prompt: 'luxury travel lifestyle portrait, premium resort or airport lounge, soft cinematic lighting, high-end travel aesthetic'
      },
      {
        id: 'cafe-life',
        name: 'Cafe Lifestyle',
        description: 'Relaxed social vibe',
        prompt: 'cafe lifestyle portrait, coffee shop environment, warm lighting, relaxed social atmosphere, candid natural moment'
      },
      {
        id: 'fitness',
        name: 'Fitness / Gym',
        description: 'Athletic lifestyle',
        prompt: 'fitness portrait in gym environment, athletic build emphasis, dramatic lighting, workout setting, strong and focused vibe'
      },
      {
        id: 'morning-routine',
        name: 'Morning Routine',
        description: 'Fresh start vibe',
        prompt: 'morning lifestyle portrait, soft sunlight, fresh and clean environment, natural calm expression, daily routine aesthetic'
      },
      {
        id: 'urban-street',
        name: 'Urban Street',
        description: 'City lifestyle',
        prompt: 'urban street portrait, city background, natural candid pose, streetwear fashion, modern lifestyle aesthetic'
      },
      {
        id: 'night-life',
        name: 'Night Life',
        description: 'Evening city vibe',
        prompt: 'night lifestyle portrait, neon lights or city night background, cinematic lighting, stylish nightlife aesthetic'
      },
      {
        id: 'home-casual',
        name: 'Home Casual',
        description: 'Everyday relaxed look',
        prompt: 'casual home lifestyle portrait, indoor relaxed environment, natural lighting, comfortable everyday look'
      },
      {
        id: 'creative-artist',
        name: 'Creative Artist',
        description: 'Artistic lifestyle',
        prompt: 'creative artist portrait, studio or creative workspace, artistic lighting, expressive mood, painter/designer vibe'
      }
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
  {
      id: 'pixar',
      name: 'Pixar 3D',
      description: 'Modern 3D animation',
      prompt: 'Pixar-inspired 3D animated portrait style applied to the entire subject including the face, stylized but recognizable same identity, large expressive eyes, soft rounded facial forms, detailed 3D render'
    },
    {
      id: 'anime',
      name: 'Anime',
      description: 'Japanese animation style',
      prompt: 'anime portrait style applied to the entire subject including the face, stylized but recognizable same identity, vibrant colors, expressive anime eyes adapted from original eye shape, high-quality Japanese animation aesthetic'
    },
    {
      id: 'ghibli',
      name: 'Ghibli Style',
      description: 'Whimsical and hand-painted',
      prompt: 'Ghibli-inspired hand-painted animation portrait style applied to the entire subject including the face, stylized but recognizable same identity, soft natural facial features, warm whimsical atmosphere'
    },
    {
      id: 'comic',
      name: 'Comic Book',
      description: 'Bold ink and colors',
      prompt: 'comic book portrait style applied to the entire subject including the face, stylized but recognizable same identity, bold ink lines, dramatic shading, vibrant colors, superhero comic aesthetic'
      },

    {
      id: 'funko',
      name: 'Funko Pop',
      description: 'Stylized collectible toy look',
      prompt: 'Funko Pop vinyl figure style, oversized head, small body proportions, simplified facial features, smooth plastic texture, minimal nose, black dot eyes, stylized but still recognizable identity'
    },
    {
      id: 'bobblehead',
      name: 'Bobblehead',
      description: 'Big head small body toy style',
      prompt: 'bobblehead figurine style, exaggerated large head and small body, semi-realistic facial adaptation, spring-mounted head feel, playful expression, stylized but recognizable identity'
    },
    {
      id: 'cartoonify',
      name: 'Cartoonify',
      description: 'Soft modern cartoon style',
      prompt: 'modern cartoon portrait style, smooth shading, clean outlines, slightly exaggerated facial features, vibrant colors, stylized but clearly recognizable identity'
    },
    {
      id: 'caricature',
      name: 'Caricature',
      description: 'Exaggerated personality features',
      prompt: 'caricature portrait style, exaggerate defining facial features (jaw, nose, eyes, forehead) while keeping identity recognizable, artistic illustration style, expressive and playful'
    },
    {
      id: 'chibi',
      name: 'Chibi',
      description: 'Cute small anime style',
      prompt: 'chibi anime style, very large head, tiny body, cute proportions, simplified facial features, big expressive eyes adapted from original, stylized but recognizable identity'
    },
    {
      id: 'clay',
      name: 'Claymation',
      description: 'Stop-motion clay look',
      prompt: 'claymation style portrait, soft clay texture, handmade sculpted look, rounded features, subtle imperfections, stylized but recognizable identity'
    },
    {
      id: 'lego',
      name: 'Lego Style',
      description: 'Blocky toy figure',
      prompt: 'lego minifigure style, blocky geometry, cylindrical head, simple printed face adapted from original identity, plastic toy texture, stylized recognizable identity'
     }
    ]
  },

  {
    id: 'social-media',
    name: 'Social Media',
    icon: 'Grid',
    styles: [
      {
        id: 'influencer',
        name: 'Influencer Aesthetic',
        description: 'Bright lifestyle look',
        prompt: 'modern influencer lifestyle portrait, bright airy lighting, trendy clean background, polished Instagram aesthetic, natural confident pose'
      },
      {
        id: 'selfie',
        name: 'Premium Selfie',
        description: 'Natural but polished',
        prompt: 'premium high-end selfie portrait, front-facing flattering angle, natural window lighting, polished skin, modern casual aesthetic'
      },
      {
        id: 'youtube',
        name: 'YouTube Thumbnail',
        description: 'Bold thumbnail style',
        prompt: 'YouTube thumbnail portrait style, vibrant popping colors, high contrast, expressive face, clean cutout-ready composition, engaging thumb-stop aesthetic'
      },
      {
        id: 'instagram-profile',
        name: 'Instagram Profile',
        description: 'Clean profile picture',
        prompt: 'Instagram profile picture portrait, centered face, clean background, flattering soft light, stylish modern look, profile-ready composition'
      },
      {
        id: 'linkedin-modern',
        name: 'LinkedIn Modern',
        description: 'Professional social profile',
        prompt: 'modern LinkedIn profile portrait, professional but approachable, clean background, sharp focus, confident expression, polished personal brand aesthetic'
      },
      {
        id: 'facebook-profile',
        name: 'Facebook Profile',
        description: 'Friendly everyday look',
        prompt: 'friendly Facebook profile portrait, natural smile, casual polished look, warm lighting, relatable social media profile aesthetic'
      },
      {
        id: 'tiktok-creator',
        name: 'TikTok Creator',
        description: 'Trendy creator look',
        prompt: 'TikTok creator portrait, trendy energetic style, colorful lighting, dynamic pose, bold youthful social media aesthetic'
      },
      {
        id: 'podcast-cover',
        name: 'Podcast Cover',
        description: 'Host branding style',
        prompt: 'podcast host cover portrait, professional branding aesthetic, dramatic studio lighting, clean background, confident host presence'
      },
      {
        id: 'personal-brand',
        name: 'Personal Brand',
        description: 'Polished authority look',
        prompt: 'personal brand portrait, premium polished aesthetic, confident approachable expression, clean modern background, authority-building profile image'
      },
      {
        id: 'viral-reel',
        name: 'Viral Reel Look',
        description: 'High-energy reel style',
        prompt: 'viral Instagram reel portrait style, bold lighting, energetic expression, high contrast colors, modern creator aesthetic, scroll-stopping composition'
      }
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
  { id: 'face-only', name: 'Face Only', description: 'Only face, tight crop' },
  { id: 'extreme-headshot', name: 'Extreme Close-Up', description: 'Face with slight head outline' },
  { id: 'classic-headshot', name: 'Classic Headshot', description: 'Head and neck' },
  { id: 'head-shoulders', name: 'Head & Shoulders', description: 'Head, neck, and shoulders' },
  { id: 'professional-bust', name: 'Professional Bust', description: 'Head to upper chest' },
  { id: 'medium-close-up', name: 'Medium Close-Up', description: 'Chest up' },
  { id: 'half-body', name: 'Half Body', description: 'Waist/chest to head' },
  { id: 'waist-up', name: 'Waist Up Shot', description: 'Waist up' },
  { id: 'three-quarter', name: 'Three-Quarter View', description: 'Knees up' },
  { id: 'cowboy-shot', name: 'Cowboy Shot', description: 'Mid-thigh up' },
  { id: 'full-body', name: 'Full Body Portrait', description: 'Head to toe' },
  { id: 'full-body-centered', name: 'Full Body Centered', description: 'Full body with centered subject and clean margins' },
  { id: 'figurine-shot', name: 'Figurine / Toy Shot', description: 'Full stylized figure, collectible/toy framing' },
  { id: 'avatar-frame', name: 'Avatar Frame', description: 'Profile-picture friendly centered portrait' },
  { id: 'environmental', name: 'Environmental Portrait', description: 'Subject in setting with visible background' },
  { id: 'wide-environmental', name: 'Wide Environmental', description: 'Subject smaller, background more visible' }
];

export const LIGHTING_OPTIONS = [
  // Natural Light
  'Soft natural',
  'Direct sunlight',
  'Golden hour sunlight',
  'Blue hour twilight',

  // Studio Lighting
  'Softbox studio lighting',
  'Ring light lighting',
  'High-key studio lighting',
  'Low-key dramatic lighting',
  'Rembrandt lighting',
  'Split lighting',

  // Cinematic / Creative
  'Cinematic dramatic lighting',
  'Moody shadow lighting',
  'Backlit silhouette',
  'Rim lighting',
  'Volumetric light rays',

  // Colored / Stylized
  'Neon glow lighting',
  'Dual color lighting (red and blue)',
  'RGB studio lighting',

  // Lifestyle / Ambient
  'Warm indoor lighting',
  'Cozy ambient lighting',
  'Fairy lights ambiance',
  'Cafe warm lighting',

  // Professional / Content
  'YouTube studio lighting',
  'Podcast studio lighting',
  'Product showcase lighting',

  // Utility
  'Flat even lighting',
  'Custom'
];

export const BACKGROUND_OPTIONS = [
  // Neutral / Studio
  'Studio plain',
  'Minimalist white',
  'Subtle gradient',
  'Solid color backdrop',

  // Professional / Work
  'Modern office',
  'Corporate office',
  'Co-working space',
  'Library bookshelf',

  // Lifestyle
  'Cozy cafe',
  'Home interior',
  'Bedroom aesthetic',
  'Luxury living room',

  // Outdoor
  'Urban street',
  'City skyline',
  'Lush garden',
  'Mountain landscape',
  'Beach sunset',
  'Forest nature',

  // Premium / Aesthetic
  'Art gallery',
  'Luxury hotel lobby',
  'Rooftop view',
  'Industrial loft',

  // Stylized / Fantasy
  'Cyberpunk city',
  'Futuristic environment',
  'Neon studio',
  'Abstract background',
  'Japanese garden',

  // Social Media / Creator
  'Instagram aesthetic setup',
  'Content creator studio',
  'Podcast studio',

  // Utility
  'Transparent background',
  'Custom'
];

export const MOOD_OPTIONS = [
  // Professional
  'Neutral professional',
  'Confident',
  'Approachable',
  'Calm and composed',
  'Serious and focused',
  'Authoritative',

  // Friendly / Social
  'Warm smile',
  'Friendly approachable',
  'Cheerful',
  'Playful',
  'Relaxed',
  'Casual candid',

  // Creative / Lifestyle
  'Creative',
  'Thoughtful',
  'Inspired',
  'Energetic',
  'Vibrant',

  // Cinematic / Dramatic
  'Mysterious',
  'Intense',
  'Bold and powerful',
  'Heroic',
  'Dark moody',

  // Soft / Fantasy
  'Dreamy',
  'Ethereal',
  'Peaceful',
  'Romantic',

  // Utility
  'Custom'
];

export const SMART_EDIT_OPTIONS = [
  {
    category: 'Essentials',
    items: [
      { id: 'background', label: 'Background', icon: 'Globe', color: 'text-blue-400', presets: ['Cyberpunk City', 'Tropical Beach', 'Minimal Studio', 'Forest at Dawn', 'Luxury Penthouse'] },
      { id: 'clothing', label: 'Clothing', icon: 'Palette', color: 'text-pink-400', presets: ['Black Suit', 'Leather Jacket', 'Bohemian Dress', 'Space Suit', 'Casual Hoodie'] },
      { id: 'pose', label: 'Pose', icon: 'Move', color: 'text-orange-400', presets: ['Walking', 'Arms Crossed', 'Leaning on Wall', 'Laughing', 'Looking Away'] },
      { id: 'lighting', label: 'Lighting', icon: 'Zap', color: 'text-yellow-400', presets: ['Golden Hour', 'Neon Cyber', 'Studio Softbox', 'Dramatic Rim', 'Candlelight'] },
      { id: 'expression', label: 'Expression', icon: 'Smile', color: 'text-green-400', presets: ['Happy Smile', 'Serious/Determined', 'Deep Thought', 'Winking', 'Surprised'] },
    ]
  },
  {
    category: 'Face & Features',
    items: [
      { id: 'makeup', label: 'Makeup', icon: 'Brush', color: 'text-rose-400', presets: ['Natural Look', 'Red Lipstick', 'Gothic/Dark', 'Glitter/Editorial', 'Remove Makeup'] },
      { id: 'teeth', label: 'Teeth', icon: 'Sparkle', color: 'text-white', presets: ['Perfect White', 'Straightened', 'Hollywood Smile', 'Subtle Enhancement'] },
      { id: 'eye-color', label: 'Eye Color', icon: 'Eye', color: 'text-cyan-400', presets: ['Bright Blue', 'Emerald Green', 'Deep Amber', 'Violet', 'Heterochromia'] },
      { id: 'eyes-open', label: 'Open Eyes', icon: 'Camera', color: 'text-indigo-400', presets: ['Fully Open', 'Looking at Camera', 'Wide Eyed'] },
      { id: 'hair', label: 'Hair Style', icon: 'Scissors', color: 'text-purple-400', presets: ['Long Wavy', 'Messy Bun', 'Short Fade', 'Vibrant Blue', 'Braided'] },
      { id: 'bald', label: 'Make Bald', icon: 'UserCircle', color: 'text-slate-200', presets: ['Clean Shave', 'Stubble Head', 'Shiny Bald'] },
      { id: 'baby-face', label: 'Baby Face', icon: 'Baby', color: 'text-pink-300', presets: ['Infant Look', 'Toddler Version', 'Cuter Features'] },
      { id: 'facial-hair', label: 'Beard/Mstch', icon: 'Wind', color: 'text-amber-600', presets: ['Full Beard', 'Van Dyke', 'Mustache', 'Clean Shaven'] },
    ]
  },
  {
    category: 'Group & Scene',
    items: [
      { id: 'remove-person', label: 'Remove Person', icon: 'Trash2', color: 'text-red-400', presets: ['Remove Left Person', 'Remove Right Person', 'Keep Only Me'] },
      { id: 'remove-bg-people', label: 'Clear BG People', icon: 'Users', color: 'text-slate-400', presets: ['Empty Street', 'Private Vibe', 'Remove Crowds'] },
      { id: 'multi-clothing', label: 'Multi Outfit', icon: 'Palette', color: 'text-purple-400', presets: ['All in Uniform', 'Color Coded', 'Theme: Black'] },
      { id: 'scene', label: 'Change Scene', icon: 'ImageIcon', color: 'text-emerald-400', presets: ['Action Movie', 'Historical Era', 'Office Meeting', 'Sci-Fi Future'] },
      { id: 'rotation', label: 'Rotation', icon: 'RotateCw', color: 'text-slate-300', presets: ['Rotate 90', 'Mirror Image', 'Bird Eye View', 'Tilt Up'] },
    ]
  },
  {
    category: 'Styling',
    items: [
      { id: 'accessories', label: 'Accessories', icon: 'Glasses', color: 'text-indigo-400', presets: ['Aviator Shades', 'Golden Watch', 'Silver Necklace', 'Fedora Hat', 'Bluetooth Buds'] },
      { id: 'tattoo', label: 'Tattoo', icon: 'Ghost', color: 'text-slate-600', presets: ['Arm Sleeve', 'Neck Tattoo', 'Face Decals', 'Small Wrist Tattoo', 'Remove Tattoos'] },
      { id: 'age', label: 'Aging Refine', icon: 'UserCircle', color: 'text-rose-400', presets: ['Age 10 Years', 'Reverse Aging', 'Vintage Look'] },
      { id: 'style', label: 'Art Style', icon: 'Brush', color: 'text-teal-400', presets: ['Oil Painting', 'Anime Style', 'Cyberpunk 2077', 'GTA Art Style', 'Pencil Sketch'] },
    ]
  }
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

  // Standing / Core
  'Neutral standing',
  'Confident standing',
  'Relaxed standing',
  'Power pose (hands on hips)',
  'Crossed arms standing',

  // Sitting
  'Relaxed sitting',
  'Professional sitting (desk)',
  'Leaning forward sitting',
  'Casual lounging',

  // Movement
  'Walking forward',
  'Walking side angle',
  'Running motion',
  'Dynamic action pose',

  // Upper Body Gestures
  'Hands in pockets',
  'One hand in pocket',
  'Hands on hips',
  'Crossed arms',
  'Arms relaxed at sides',

  // Interaction / Expression
  'Waving',
  'Pointing forward',
  'Pointing sideways',
  'Thinking pose (hand on chin)',
  'Looking over shoulder',

  // Lifestyle-specific
  'Working on laptop',
  'Holding phone',
  'Coffee holding pose',
  'Fitness stance',
  'Creative working pose',

  // Camera-oriented
  'Facing camera directly',
  'Slight angle pose',
  'Profile side view',
  'Over-the-shoulder look',

  // Stylized / Character (important for your system)
  'Hero pose',
  'Cartoon idle stance',
  'Toy figurine stance',

  // Custom input
  'Custom'
];
export const BATCH_COUNTS: (1 | 2)[] = [1, 2];
