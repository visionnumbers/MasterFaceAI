import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Sparkles, Wand2, Info, ChevronRight, History, Heart, X, Zap, UserCheck, Globe, Palette, Move, Smile, Scissors, Glasses, Frame, Brush, UserCircle, Image as ImageIcon, Camera, RotateCw, Sparkle, Wind, Eye, Users, Baby, Tent, Trash2, Ghost } from 'lucide-react';
import { Header } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { GenerationPanel } from './components/GenerationPanel';
import { AdvancedPanel } from './components/AdvancedPanel';
import { ResultsGallery } from './components/ResultsGallery';
import { Lightbox } from './components/Lightbox';
import { ImagePromptExtractor } from './components/ImagePromptExtractor';
import { GenerationSettings, GeneratedImage } from './types';
import { fileToBase64, cn } from './lib/utils';
import { analyzeFace, analyzeStyleReference, generateProfilePicture } from './services/geminiService';
import JSZip from 'jszip';
import { SHOT_RANGES, SMART_EDIT_OPTIONS } from './constants';

const SMART_EDIT_ICONS: Record<string, any> = {
  Globe, Palette, Move, Zap, Smile, Brush, Sparkle, Eye, Camera, Scissors, UserCircle, Baby, Wind, Trash2, Users, ImageIcon, RotateCw, Glasses, Ghost
};

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState(true);
  
  // App state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [styleFile, setStyleFile] = useState<File | null>(null);
  const [isStylesOpen, setIsStylesOpen] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stylePreviewUrl, setStylePreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  const [faceDescription, setFaceDescription] = useState<string | null>(null);
  const [styleDescription, setStyleDescription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldownTime, setCooldownTime] = useState<number>(0);

  // Settings state
  const [settings, setSettings] = useState<GenerationSettings>({
    mode: 'built-in',
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
    setStyleDescription(null); // Reset style description too for smart edit
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleStyleFileSelect = (file: File) => {
    setStyleFile(file);
    setStyleDescription(null);
    if (file) {
      const url = URL.createObjectURL(file);
      setStylePreviewUrl(url);
    } else {
      setStylePreviewUrl(null);
    }
  };

  const handleSmartEditAttribute = (attr: any) => {
    setSettings(prev => ({
      ...prev,
      smartEdit: {
        activeAttribute: attr,
        value: prev.smartEdit?.activeAttribute === attr ? prev.smartEdit.value : ''
      }
    }));
  };

  const handleGenerateFromExtractor = async (prompt: string, imageFile: File) => {
    // Sync state before generate
    setSelectedFile(imageFile);
    setSettings(prev => ({
      ...prev,
      mode: 'extractor',
      count: 4, // 4 variations as requested
      extractor: {
        extractedPrompt: prompt,
        isExtracted: true
      }
    }));
    
    // We need to wait for state to update or just call with local values
    // Since handleGenerate uses state, we can try to call it in next tick or just copy-paste logic
    // For simplicity, let's call handleGenerate and rely on state being mostly correct or pass params
  };

  // Improved handleGenerate to accept optional overrides
  const handleGenerate = async (overrides?: Partial<GenerationSettings>, overrideFile?: File, overridePrompt?: string) => {
    const activeFile = overrideFile || selectedFile;
    if (!activeFile || cooldownTime > 0) return;
    
    const activeSettings = overrides ? { ...settings, ...overrides } : settings;

    if (activeSettings.mode === 'reference' && !styleFile) {
      setError('Please upload a style reference photo.');
      return;
    }
    if (activeSettings.mode === 'smart-edit' && (!activeSettings.smartEdit?.activeAttribute || !activeSettings.smartEdit?.value)) {
      setError('Please select an attribute to edit and provide a description.');
      return;
    }
    
    try {
      setIsGenerating(true);
      const base64 = await fileToBase64(activeFile);
      const styleBase64 = styleFile ? await fileToBase64(styleFile) : undefined;
      
      let currentFaceDesc = faceDescription;
      if (!currentFaceDesc) {
        setError(null);
        setGenerationPhase('Locking Identity: Analyzing facial geometry...');
        currentFaceDesc = await analyzeFace(base64);
        setFaceDescription(currentFaceDesc);
      }

      let currentStyleDesc = styleDescription;
      // In smart-edit mode, Image 1 is the scene blueprint
      if (activeSettings.mode === 'smart-edit' && !currentStyleDesc) {
        setGenerationPhase("Smart Edit: Indexing original scene...");
        currentStyleDesc = await analyzeStyleReference(base64);
        setStyleDescription(currentStyleDesc);
      } else if (activeSettings.mode === 'reference' && styleFile && !currentStyleDesc) {
        setGenerationPhase("Style Transfer: Deconstructing reference vectors...");
        const styleBase64ForAnalysis = await fileToBase64(styleFile);
        currentStyleDesc = await analyzeStyleReference(styleBase64ForAnalysis);
        setStyleDescription(currentStyleDesc);
      }

      setGenerationPhase(`Synthesizing ${activeSettings.count} Neural Layers...`);
      
      // Generate images in sequence with a small delay to avoid rate limits
      for (let i = 0; i < activeSettings.count; i++) {
        // Add a small stagger delay between images in a batch to avoid immediate rate limits
        if (i > 0) {
          setGenerationPhase(`Engine Cooling: Ready in 5s...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }

        setGenerationPhase(`Rendering Instance ${i + 1} of ${activeSettings.count}...`);
        const result = await generateProfilePicture(
          base64, 
          currentFaceDesc || '', 
          activeSettings, 
          styleBase64,
          currentStyleDesc || undefined
        );

        if (!result || !result.url) {
          throw new Error("Invalid image data received from generator.");
        }

        const newImage: GeneratedImage = {
          id: Math.random().toString(36).substring(7),
          url: result.url,
          prompt: result.prompt,
          styleName: activeSettings.mode.toUpperCase(),
          ratio: activeSettings.ratio,
          timestamp: Date.now()
        };

        setGeneratedImages(prev => [newImage, ...prev]);

        // Add a 3s delay between requests to avoid hitting rate limits for the 1000/day quota
        if (i < activeSettings.count - 1) {
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
            {settings.mode === 'reference' ? (
              <>
                <div className="col-span-12 md:col-span-6 h-full space-y-3">
                  <div className="flex flex-col gap-1 mb-1">
                    <div className="flex items-center gap-2">
                       <UserCheck className="w-5 h-5 text-teal-500" />
                       <span className="text-xs font-black uppercase tracking-[0.25em] text-white">Your Face (Identity Locked)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Your exact face — 100% identity will be preserved</span>
                  </div>
                  <div className="relative group/identity h-[180px]">
                    <Dropzone 
                      onFileSelect={handleFileSelect} 
                      selectedFile={selectedFile} 
                      previewUrl={previewUrl}
                      isDark={isDark}
                    />
                    {previewUrl && (
                      <div className="absolute top-3 left-3 flex gap-2">
                        <div className="px-3 py-1 bg-teal-500 text-slate-950 text-[9px] font-black uppercase tracking-tighter rounded-full shadow-lg pointer-events-none">
                          Identity Source
                        </div>
                        {faceDescription && (
                          <div className="px-3 py-1 bg-slate-900/80 text-teal-400 text-[9px] font-black uppercase tracking-tighter rounded-full shadow-lg border border-teal-500/30">
                            Face Analyzed
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-12 md:col-span-6 h-full space-y-3">
                  <div className="flex flex-col gap-1 mb-1">
                    <div className="flex items-center gap-2">
                       <Sparkles className="w-5 h-5 text-teal-400" />
                       <span className="text-xs font-black uppercase tracking-[0.25em] text-white">Style Reference</span>
                    </div>
                    <span className="text-[10px] text-teal-600/70 font-bold uppercase">Pose, clothing, lighting & background guide</span>
                  </div>
                  <div className="relative group/style h-[180px]">
                    <Dropzone 
                      onFileSelect={handleStyleFileSelect} 
                      selectedFile={styleFile} 
                      previewUrl={stylePreviewUrl}
                      isDark={isDark}
                    />
                    {stylePreviewUrl && (
                      <div className="absolute top-3 left-3 flex gap-2">
                        <div className="px-3 py-1 bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-tighter rounded-full shadow-lg pointer-events-none">
                          Style Master
                        </div>
                        {styleDescription && (
                          <div className="px-3 py-1 bg-slate-900/80 text-amber-400 text-[9px] font-black uppercase tracking-tighter rounded-full shadow-lg border border-amber-500/30">
                            Style Mapped
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : settings.mode === 'smart-edit' ? (
              <div className="col-span-12 h-full flex flex-col gap-6">
                 {/* Top Row: Photo Upload & Prompt View */}
                 <div className="flex flex-col md:flex-row gap-6 h-auto md:h-[240px]">
                   <div className="w-full md:w-1/2 h-full">
                      <div className="flex flex-col gap-1 mb-3">
                        <div className="flex items-center gap-2">
                           <UserCheck className="w-5 h-5 text-purple-500" />
                           <span className="text-xs font-black uppercase tracking-[0.25em] text-white">Source Photo (Face Locked)</span>
                        </div>
                        <span className="text-[10px] text-purple-600 font-bold uppercase">Base identity and scene mapping</span>
                      </div>
                      <Dropzone 
                        onFileSelect={handleFileSelect} 
                        selectedFile={selectedFile} 
                        previewUrl={previewUrl}
                        isDark={isDark}
                        hideLabel={true}
                      />
                   </div>
                   
                   <div className="w-full md:w-1/2 flex flex-col justify-end">
                      <AnimatePresence mode="wait">
                        {settings.smartEdit?.activeAttribute ? (
                          <motion.div
                            key={settings.smartEdit.activeAttribute}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-md shadow-2xl relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                               <Wand2 className="w-32 h-32 text-purple-500" />
                            </div>

                            <div className="flex items-center justify-between relative z-10">
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-purple-500/20 rounded-xl">
                                    {(() => {
                                      const btn = SMART_EDIT_OPTIONS.flatMap(c => c.items).find(i => i.id === settings.smartEdit?.activeAttribute);
                                      const Icon = btn?.icon ? SMART_EDIT_ICONS[btn.icon as string] : Sparkles;
                                      return Icon ? <Icon className="w-5 h-5 text-purple-400" /> : <Sparkles className="w-5 h-5 text-purple-400" />;
                                    })()}
                                 </div>
                                 <div>
                                   <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest block">
                                      Editing {settings.smartEdit.activeAttribute.replace('-', ' ')}
                                   </label>
                                   <span className="text-[8px] text-slate-500 font-bold uppercase">Precision Neural Mapping</span>
                                 </div>
                              </div>
                            </div>

                            <div className="space-y-3 relative z-10">
                              <div className="flex flex-wrap gap-2">
                                {SMART_EDIT_OPTIONS.flatMap(c => c.items)
                                  .find(i => i.id === settings.smartEdit?.activeAttribute)?.presets?.map(preset => (
                                    <button
                                      key={preset}
                                      onClick={() => setSettings(prev => ({
                                        ...prev,
                                        smartEdit: { ...prev.smartEdit!, value: preset }
                                      }))}
                                      className={cn(
                                        "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all",
                                        settings.smartEdit?.value === preset
                                          ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                                      )}
                                    >
                                      {preset}
                                    </button>
                                  ))}
                              </div>

                              <div className="relative">
                                <input 
                                  type="text"
                                  placeholder="Or type custom instruction..."
                                  value={settings.smartEdit.value || ''}
                                  onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    smartEdit: { ...prev.smartEdit!, value: e.target.value }
                                  }))}
                                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-5 py-4 text-xs text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all placeholder:text-slate-700 font-medium"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                   <Sparkles className="w-4 h-4 text-purple-500/30" />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-900/20 border-2 border-dashed border-slate-800/50 rounded-3xl text-center">
                             <Wand2 className="w-12 h-12 text-slate-700 mb-4 animate-pulse" />
                             <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Select an attribute below</h3>
                             <p className="text-[10px] text-slate-600 mt-2 font-bold uppercase tracking-widest">To begin precision editing</p>
                          </div>
                        )}
                      </AnimatePresence>
                   </div>
                 </div>

                 {/* Bottom Grid: Attribute Selector Categories */}
                 <div className="space-y-6">
                    {SMART_EDIT_OPTIONS.map((category) => (
                      <div key={category.category} className="space-y-3">
                        <div className="flex items-center gap-3 px-1">
                           <div className="h-[1px] flex-1 bg-slate-900" />
                           <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] whitespace-nowrap">{category.category}</h4>
                           <div className="h-[1px] flex-1 bg-slate-900" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                           {category.items.map((btn) => (
                             <button
                               key={btn.id}
                               onClick={() => handleSmartEditAttribute(btn.id)}
                               className={cn(
                                 "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 group/btn",
                                 settings.smartEdit?.activeAttribute === btn.id
                                   ? "bg-purple-500/20 border-purple-500 shadow-xl shadow-purple-500/10 scale-[1.02]"
                                   : "bg-slate-900/40 border-slate-800/50 text-slate-500 hover:border-slate-700 hover:bg-slate-800/80 hover:scale-[1.02]"
                               )}
                             >
                               <div className={cn(
                                 "p-2 rounded-xl transition-colors",
                                 settings.smartEdit?.activeAttribute === btn.id ? "bg-purple-500/20" : "bg-slate-950/50 group-hover/btn:bg-slate-900"
                               )}>
                                 {(() => {
                                   const Icon = SMART_EDIT_ICONS[btn.icon as string] || Sparkles;
                                   return <Icon className={cn("w-4 h-4", settings.smartEdit?.activeAttribute === btn.id ? "text-purple-400" : btn.color)} />;
                                 })()}
                               </div>
                               <span className={cn(
                                 "text-[9px] font-black uppercase tracking-tighter text-center leading-tight",
                                 settings.smartEdit?.activeAttribute === btn.id ? "text-purple-300" : "text-slate-400"
                               )}>{btn.label}</span>
                             </button>
                           ))}
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            ) : settings.mode === 'extractor' ? (
              <div className="col-span-12 h-full">
                <ImagePromptExtractor 
                  isDark={isDark} 
                  isGenerating={isGenerating}
                  imageCount={settings.count}
                  onGenerateVariations={(prompt, file) => {
                    handleGenerate({
                      mode: 'extractor',
                      count: settings.count,
                      extractor: { extractedPrompt: prompt, isExtracted: true }
                    }, file);
                  }}
                />
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {settings.mode === 'reference' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-500/5 border border-teal-500/10 -mt-2">
              <Info className="w-3.5 h-3.5 text-teal-500 shrink-0" />
              <p className="text-[10px] text-teal-600/80 font-bold uppercase tracking-wider">
                Style Reference Mode Active: This mode ignores all built-in styles and uses your reference photo as the master style guide.
              </p>
            </div>
          )}

          {settings.mode === 'smart-edit' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 -mt-2">
              <Zap className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <p className="text-[10px] text-purple-600/80 font-bold uppercase tracking-wider">
                Smart Edit Mode Active: Select an attribute to change while locking your identity and original scene.
              </p>
            </div>
          )}

          {settings.mode === 'extractor' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 -mt-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <p className="text-[10px] text-purple-600/80 font-bold uppercase tracking-wider">
                Prompt Extractor Active: Upload an image to analyze its visual DNA and generate variations.
              </p>
            </div>
          )}

          {/* Generate Action Area (New) */}
          <div className={cn("flex justify-center -mb-2 relative z-20", settings.mode === 'extractor' && "hidden")}>
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
