import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Sparkles, Wand2, Info, ChevronRight, History, Heart, X, Zap } from 'lucide-react';
import { Header } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { GenerationPanel } from './components/GenerationPanel';
import { AdvancedPanel } from './components/AdvancedPanel';
import { ResultsGallery } from './components/ResultsGallery';
import { Lightbox } from './components/Lightbox';
import { GenerationSettings, GeneratedImage } from './types';
import { fileToBase64, cn } from './lib/utils';
import { analyzeFace, generateProfilePicture } from './services/geminiService';
import JSZip from 'jszip';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState(true);
  
  // App state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isStylesOpen, setIsStylesOpen] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  const [faceDescription, setFaceDescription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldownTime, setCooldownTime] = useState<number>(0);

  // Settings state
  const [settings, setSettings] = useState<GenerationSettings>({
    gender: 'male',
    shotRange: 'professional-bust',
    styleId: 'corporate',
    count: 1,
    weight: 'Keep original',
    age: 'Keep original',
    lighting: 'Soft natural',
    background: 'Studio plain',
    pose: 'Keep original pose',
    mood: 'Confident',
    ratio: '1:1',
    quality: 'high',
    negativePrompt: ''
  });

  // Effects
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownTime]);
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const saved = localStorage.getItem('mf_library');
    if (saved) {
      try {
        setGeneratedImages(JSON.parse(saved).slice(0, 8)); // Keep only latest 8 on load
      } catch (e) {
        console.error("Failed to load library", e);
      }
    }
  }, []);

  useEffect(() => {
    if (generatedImages.length > 0) {
      try {
        // Only store the latest 8 images to prevent quota issues
        const toStore = generatedImages.slice(0, 8);
        localStorage.setItem('mf_library', JSON.stringify(toStore));
      } catch (e) {
        console.warn("Storage quota exceeded, could not save to library.", e);
        // If it fails, we just don't save. The app won't crash now.
      }
    }
  }, [generatedImages]);

  const clearLibrary = () => {
    setGeneratedImages([]);
    localStorage.removeItem('mf_library');
  };

  const handleClearGallery = () => {
    clearLibrary();
  };

  // Handlers
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setFaceDescription(null);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile || cooldownTime > 0) return;
    
    try {
      setIsGenerating(true);
      const base64 = await fileToBase64(selectedFile);
      
      if (!faceDescription) {
        setError(null);
        setGenerationPhase('Analyzing facial geometry...');
        const description = await analyzeFace(base64);
        setFaceDescription(description);
        
        // Add delay after facial analysis to avoid hitting rate limits too quickly
        setGenerationPhase('Identity locked. Preparing professional prompts...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      setGenerationPhase(`Synthesizing ${settings.count} images...`);
      
      // Generate images in sequence with a small delay to avoid rate limits
      for (let i = 0; i < settings.count; i++) {
        // Add a small stagger delay between images in a batch to avoid immediate rate limits
        if (i > 0) {
          setGenerationPhase(`Cooling down... (Next in 5s)`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }

        setGenerationPhase(`Generating image ${i + 1} of ${settings.count}...`);
        const imageUrl = await generateProfilePicture(base64, faceDescription || '', settings);

        if (!imageUrl || typeof imageUrl !== 'string') {
          throw new Error("Invalid image data received from generator.");
        }

        const newImage: GeneratedImage = {
          id: Math.random().toString(36).substring(7),
          url: imageUrl,
          prompt: `Identity lock enabled. Style: ${settings.styleId}. Range: ${settings.shotRange}. Pose: ${settings.pose}.`,
          styleName: settings.styleId.toUpperCase(),
          ratio: settings.ratio,
          timestamp: Date.now()
        };

        setGeneratedImages(prev => [newImage, ...prev]);

        // Add a 3s delay between requests to avoid hitting rate limits for the 1000/day quota
        if (i < settings.count - 1) {
          await new Promise(resolve => setTimeout(resolve, 3500));
        }
      }
      
      setGenerationPhase('Success! Cooldown active for 120s.');
      setCooldownTime(120);
      setTimeout(() => {
        if (!isGenerating) setGenerationPhase('');
      }, 5000);
    } catch (error: any) {
      console.error("Generation failed", error);
      let errorMsg = 'Generation failed. Please wait for cooldown and try again.';
      
      // Extract deep error message if it exists in the Google AI SDK error format
      let errorDetail = '';
      try {
        if (typeof error === 'object' && error !== null) {
          errorDetail = error.message || '';
          if (error.response?.text) {
            errorDetail += ' ' + await error.response.text();
          }
          // If message is generic, try stringifying the whole thing to find codes
          if (errorDetail === 'Generation failed' || !errorDetail) {
            errorDetail = JSON.stringify(error);
          }
        } else {
          errorDetail = String(error);
        }
      } catch (e) {
        errorDetail = String(error);
      }
      
      if (errorDetail.includes('429') || errorDetail.includes('Quota') || errorDetail.includes('RESOURCE_EXHAUSTED')) {
        errorMsg = 'AI Studio Quota Reached. Please wait 120 seconds before retrying.';
      } else if (errorDetail.includes('Safety') || errorDetail.includes('blocked') || errorDetail.includes('safety filters') || errorDetail.includes('no image was returned')) {
        errorMsg = 'Content Blocked. Your photo or the generated result was flagged by safety filters. Try a different photo.';
      } else if (errorDetail.includes('billing')) {
        errorMsg = 'API configuration error. Please check your Gemini API key.';
      }
      
      setGenerationPhase(errorMsg);
      setError(errorMsg);
      setCooldownTime(120);
      setTimeout(() => {
        setError(null);
        if (!isGenerating) setGenerationPhase('');
      }, 30000); 
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (id: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id));
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    const folder = zip.folder("masterface-generations");
    generatedImages.forEach((img, i) => {
      const base64Data = img.url.split(',')[1];
      folder?.file(`portrait-${i + 1}.png`, base64Data, { base64: true });
    });
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = "masterface-library.zip";
    link.click();
  };

  const scrollToLibrary = () => {
    document.getElementById('library-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const openStyles = () => {
    setIsStylesOpen(true);
    document.getElementById('styles-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen w-full flex flex-col ${isDark ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'} font-sans overflow-x-hidden transition-colors duration-300`}>
      <Header 
        isDark={isDark} 
        toggleTheme={() => setIsDark(!isDark)} 
        onScrollToLibrary={scrollToLibrary}
        onOpenStyles={openStyles}
      />

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden overflow-y-auto md:overflow-hidden">
        {/* Sidebar */}
        <aside className="md:w-64 lg:w-72 w-full shrink-0 border-r border-slate-800 flex flex-col order-2 md:order-1">
          <GenerationPanel 
            settings={settings}
            setSettings={setSettings}
            onGenerate={handleGenerate}
            disabled={!selectedFile || cooldownTime > 0}
            isGenerating={isGenerating}
            error={error}
            phase={cooldownTime > 0 ? `Cooldown: ${cooldownTime}s` : generationPhase}
            cooldownTime={cooldownTime}
            isStylesOpen={isStylesOpen}
            setIsStylesOpen={setIsStylesOpen}
            isDark={isDark}
          />
        </aside>

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col p-4 md:p-6 gap-4 md:gap-6 ${isDark ? 'bg-slate-950' : 'bg-white'} overflow-y-auto transition-colors duration-300 custom-scrollbar order-1 md:order-2`}>
          
          {/* Top Section: Hero & Reference */}
          <div className="grid grid-cols-12 gap-4 md:gap-6 shrink-0 h-auto min-h-[11rem] md:min-h-[12rem]">
            <div className="col-span-12 lg:col-span-4 h-full">
              <Dropzone 
                onFileSelect={handleFileSelect} 
                selectedFile={selectedFile} 
                previewUrl={previewUrl}
                isDark={isDark}
              />
            </div>
            
            <div className={`hidden lg:col-span-8 lg:flex flex-col justify-center gap-1 ${isDark ? 'bg-slate-900/30' : 'bg-slate-100'} border-2 border-dashed ${isDark ? 'border-slate-800' : 'border-slate-200'} rounded-2xl px-8 h-full`}>
              <h2 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
                {isGenerating ? "Synthesizing masterpiece..." : "Studio-grade portraits."}
              </h2>
              <p className={`text-slate-400 text-[10px] md:text-xs max-w-lg leading-relaxed ${!isDark && 'text-slate-600'}`}>
                {error ? (
                  <span className="text-red-400 font-bold">{error}</span>
                ) : isGenerating ? (
                  generationPhase
                ) : (
                  "Upload a photo to lock your identity. Our AI generates perfect headshots while keeping your features 100% identical."
                )}
              </p>
              <div className="flex gap-3 mt-1">
                <button 
                  onClick={() => document.getElementById('dropzone-container')?.click()}
                  className={`px-3 py-1 ${isDark ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'} rounded text-[10px] font-bold border transition-colors shadow-sm`}
                >
                  {selectedFile ? "REPLACE PHOTO" : "UPLOAD PHOTO"}
                </button>
                <button 
                  disabled={!selectedFile}
                  onClick={() => handleFileSelect(null as any)}
                  className={`px-3 py-1 ${isDark ? 'bg-slate-900 border-slate-800 hover:bg-red-500/10' : 'bg-slate-50 border-slate-200 hover:bg-red-50'} text-red-500 rounded text-[10px] border transition-all font-bold disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  CLEAR PHOTO
                </button>
              </div>
            </div>
          </div>

          {/* Generate Action Area (New) */}
          <div className="flex justify-center -mb-2 relative z-20">
            <button
              id="main-generate-button"
              disabled={!selectedFile || isGenerating}
              onClick={handleGenerate}
              className={cn(
                "group relative overflow-hidden px-12 py-5 rounded-2xl font-black text-lg tracking-tighter uppercase transition-all shadow-2xl",
                !selectedFile || isGenerating 
                  ? "bg-slate-800 text-slate-600 cursor-not-allowed opacity-50 gray-scale" 
                  : "bg-teal-500 text-slate-950 hover:bg-teal-400 hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {/* Button Inner Content */}
              <div className="relative z-10 flex items-center gap-3">
                {isGenerating ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Zap className="w-6 h-6 fill-current" />
                  </motion.div>
                ) : (
                  <Zap className="w-6 h-6 fill-current" />
                )}
                <span>{isGenerating ? "Synthesizing..." : cooldownTime > 0 ? `Cooldown (${cooldownTime}s)` : "Generate Masterpiece"}</span>
              </div>
              
              {/* Gloss effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            {/* Context Tooltip/Shadow */}
            <div className="absolute -bottom-12 text-[10px] uppercase font-black tracking-[0.2em] text-slate-600 pointer-events-none">
              Identity-Locked Synthesis Engine v4.0
            </div>
          </div>

          {/* Bottom Section: Gallery */}
          <div id="library-section" className={`flex-1 flex flex-col ${isDark ? 'bg-slate-950/50 border-slate-900/50' : 'bg-white border-slate-200'} rounded-2xl border p-4 min-h-[400px] relative overflow-hidden shadow-sm transition-colors duration-300 mt-8`}>
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  className="absolute top-0 left-0 right-0 z-[60] bg-red-600 text-white p-4 text-center text-xs font-bold flex items-center justify-center gap-3 shadow-2xl"
                >
                  <Info className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-center">{error}</span>
                  <button onClick={() => setError(null)} className="ml-auto bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`flex justify-between items-center border-b ${isDark ? 'border-slate-800' : 'border-slate-100'} pb-4 mb-6 shrink-0 pt-2`}>
              <div className="space-y-0.5">
                <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'} uppercase tracking-wider`}>Library results</h3>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Identity-preserved professional generations</p>
              </div>
              <div className="flex gap-4 text-[9px] font-black tracking-widest relative z-50 pointer-events-auto">
                {generatedImages.length > 0 && (
                  <>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearGallery();
                      }}
                      className="px-3 py-1 bg-red-500/10 text-red-500 rounded border border-red-500/20 hover:bg-red-500 hover:text-white transition-all cursor-pointer pointer-events-auto"
                    >
                      CLEAR GALLERY
                    </button>
                    <button 
                      onClick={downloadAll}
                      className="text-teal-600 dark:text-teal-400 flex items-center gap-1.5 hover:text-teal-500 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      DOWNLOAD ZIP
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 pr-2">
              <ResultsGallery 
                images={generatedImages} 
                onDelete={handleDelete}
                onOpenLightbox={setLightboxImage}
                isDark={isDark}
              />
            </div>
          </div>
          
        </div>

        {/* Advanced Panel (Right Sidebar) */}
        <aside className="md:w-64 lg:w-72 xl:w-80 w-full shrink-0 border-l border-slate-800 order-3 block bg-slate-900/10">
          <AdvancedPanel 
            settings={settings}
            setSettings={setSettings}
            isDark={isDark}
          />
        </aside>
      </main>

      {/* Full Width Dynamic Footer */}
      <footer className={cn(
        "shrink-0 border-t z-50 transition-all duration-300",
        isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-100 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]"
      )}>
        <div className="max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-800/10">
            {/* Branding Column */}
            <div className={`p-6 border-r ${isDark ? 'border-slate-800/30' : 'border-slate-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-slate-950 text-xs font-black shadow-lg shadow-teal-500/20">MF</div>
                <div>
                  <h3 className={cn("text-xs font-black uppercase tracking-[0.2em]", isDark ? "text-white" : "text-slate-900")}>MasterFace</h3>
                  <p className="text-[8px] text-teal-600 font-bold tracking-widest uppercase">Synthetic Corp ©2024</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                The world's leading identity-safe portrait synthesis engine. Dedicated to professional excellence.
              </p>
            </div>

            {/* Performance Node */}
            <div className={`p-6 border-r ${isDark ? 'border-slate-800/30' : 'border-slate-100'}`}>
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">System Node: H100-v2</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 uppercase tracking-wider font-bold">Node Vitality</span>
                  <span className="text-teal-500 font-bold font-mono">99.99%</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 uppercase tracking-wider font-bold">Latency Pool</span>
                  <span className={cn("font-bold font-mono", isDark ? "text-slate-300" : "text-slate-600")}>14ms</span>
                </div>
                <div className="h-0.5 w-full bg-slate-800/20 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-teal-500" 
                    animate={{ x: ["-100%", "100%"] }} 
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </div>
            </div>

            {/* Technical Parameters */}
            <div className={`p-6 border-r ${isDark ? 'border-slate-800/30' : 'border-slate-100'}`}>
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Engine Specs</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[8px] text-slate-500 uppercase font-black mb-0.5">Architecture</div>
                  <div className={cn("text-[10px] font-bold", isDark ? "text-slate-200" : "text-slate-800")}>DIFFUSION XL</div>
                </div>
                <div>
                  <div className="text-[8px] text-slate-500 uppercase font-black mb-0.5">Identity Lock</div>
                  <div className={cn("text-[10px] font-bold", isDark ? "text-slate-200" : "text-slate-800")}>ACTIVE</div>
                </div>
              </div>
            </div>

            {/* Session Actions */}
            <div className="p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Session ID</h3>
                  <code className={cn("text-[10px] font-mono", isDark ? "text-teal-500/80" : "text-teal-600")}>#8429-AF</code>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Live</span>
                </div>
              </div>
              <div className="flex gap-4">
                {['Help', 'Privacy', 'API'].map(link => (
                  <a key={link} href="#" className="text-[9px] font-black text-slate-500 uppercase hover:text-teal-500 transition-colors tracking-widest">{link}</a>
                ))}
              </div>
            </div>
          </div>

          <div className={`px-6 py-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.25em] ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>
             <span>Precision Engineered in Antigravity Studios</span>
             <span className="hidden sm:inline">User Authenticated: 842-9AF-STUDIO</span>
          </div>
        </div>
      </footer>

        <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
      </div>
    );
}
