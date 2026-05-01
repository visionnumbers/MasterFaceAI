import { 
  Sparkles, Camera, Palette, Layers, Smartphone, BookOpen, Zap, 
  Wand2, Box, Package, Monitor, UserCircle, Sun, RotateCw, BadgeCheck,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCT_SHOT_FEATURES } from '../constants';
import { cn } from '../lib/utils';
import { Dropzone } from './Dropzone';

const PRODUCT_SHOT_ICONS: Record<string, any> = {
  Camera, Sparkles, Wand2, Palette, Layers, 
  Smartphone, BookOpen, Zap, Box, Package, 
  Monitor, UserCircle, Sun, RotateCw, BadgeCheck
};

interface ProductShotModeProps {
  settings: any;
  setSettings: (settings: any) => void;
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  tryOnPersonFile?: File | null;
  onTryOnPersonSelect?: (file: File) => void;
  tryOnPersonPreviewUrl?: string | null;
  isDark: boolean;
}

export function ProductShotMode({ 
  settings, 
  setSettings, 
  selectedFile, 
  onFileSelect, 
  previewUrl, 
  tryOnPersonFile,
  onTryOnPersonSelect,
  tryOnPersonPreviewUrl,
  isDark 
}: ProductShotModeProps) {
  
  const isTryOn = settings.productShot?.activeFeature === 'virtual-try-on';

  const handleFeatureSelect = (featureId: string) => {
    setSettings((prev: any) => ({
      ...prev,
      productShot: {
        ...prev.productShot,
        activeFeature: featureId,
        value: prev.productShot?.activeFeature === featureId ? prev.productShot.value : ''
      }
    }));
  };

  const updateProductValue = (value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      productShot: {
        ...prev.productShot,
        value
      }
    }));
  };

  const updateProductPrompt = (prompt: string) => {
    setSettings((prev: any) => ({
      ...prev,
      productShot: {
        ...prev.productShot,
        customPrompt: prompt
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Photo Upload & Control View */}
      <div className="flex flex-col md:flex-row gap-6 h-auto md:min-h-[240px]">
        <div className={cn("w-full transition-all duration-500", isTryOn ? "md:w-3/5 grid grid-cols-2 gap-4" : "md:w-1/2")}>
          {isTryOn ? (
            <>
              <div className="col-span-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-2 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-200/80 leading-relaxed">
                  <span className="font-bold text-amber-400 block mb-0.5 uppercase tracking-wider">Safety Policy Notice</span>
                  Some products (lingerie, inner wear, revealing outfits) may be blocked by AI safety filters. 
                  We recommend using modest clothing, dresses, watches, or jewelry for best results.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Box 1: Person</span>
                  </div>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Identity Lock Reference</span>
                </div>
                <div className="h-[180px]">
                  <Dropzone 
                    onFileSelect={onTryOnPersonSelect || (() => {})} 
                    selectedFile={tryOnPersonFile || null} 
                    previewUrl={tryOnPersonPreviewUrl || null}
                    isDark={isDark}
                    hideLabel={true}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-teal-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Box 2: Product</span>
                  </div>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Item to be worn</span>
                </div>
                <div className="h-[180px]">
                  <Dropzone 
                    onFileSelect={onFileSelect} 
                    selectedFile={selectedFile} 
                    previewUrl={previewUrl}
                    isDark={isDark}
                    hideLabel={true}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1 mb-3">
                <div className="flex items-center gap-2">
                  <Box className="w-5 h-5 text-teal-500" />
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-white">Upload Product Photo</span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Object, product, or base subject for transformation</span>
              </div>
              <div className="h-[200px]">
                <Dropzone 
                  onFileSelect={onFileSelect} 
                  selectedFile={selectedFile} 
                  previewUrl={previewUrl}
                  isDark={isDark}
                  hideLabel={true}
                />
              </div>
            </>
          )}
        </div>
        
        <div className={cn("w-full flex flex-col justify-end transition-all duration-500", isTryOn ? "md:w-2/5" : "md:w-1/2")}>
          <AnimatePresence mode="wait">
            {settings.productShot?.activeFeature ? (
              <motion.div
                key={settings.productShot.activeFeature}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-md shadow-2xl relative overflow-hidden h-full flex flex-col justify-center"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Zap className="w-32 h-32 text-teal-500" />
                </div>

                <div className="flex items-center gap-3 relative z-10 mb-2">
                  <div className="p-2.5 bg-teal-500/20 rounded-xl">
                    {(() => {
                      const btn = PRODUCT_SHOT_FEATURES.flatMap(c => c.items).find(i => i.id === settings.productShot?.activeFeature);
                      const Icon = btn?.icon ? PRODUCT_SHOT_ICONS[btn.icon as string] : Box;
                      return Icon ? <Icon className="w-5 h-5 text-teal-400" /> : <Box className="w-5 h-5 text-teal-400" />;
                    })()}
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-teal-400 uppercase tracking-widest block">
                      {PRODUCT_SHOT_FEATURES.flatMap(c => c.items).find(i => i.id === settings.productShot?.activeFeature)?.label}
                    </label>
                    <span className="text-[8px] text-slate-500 font-bold uppercase">Commercial Grade Synthesis</span>
                  </div>
                </div>

                {(() => {
                  const feature = PRODUCT_SHOT_FEATURES.flatMap(c => c.items).find(i => i.id === settings.productShot?.activeFeature);
                  return feature?.description ? (
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-2 relative z-10">
                      {feature.description}
                    </p>
                  ) : null;
                })()}

                <div className="space-y-4 relative z-10">
                  <div className="flex flex-wrap gap-1.5">
                    {PRODUCT_SHOT_FEATURES.flatMap(c => c.items)
                      .find(i => i.id === settings.productShot?.activeFeature)?.presets?.map(preset => (
                        <button
                          key={preset}
                          onClick={() => updateProductValue(preset)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all whitespace-nowrap",
                            settings.productShot?.value === preset
                              ? "bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20"
                              : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                          )}
                        >
                          {preset}
                        </button>
                      ))}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="Manual overrides (e.g. adjust lighting, specific environment)..."
                        value={settings.productShot.value || ''}
                        onChange={(e) => updateProductValue(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-5 py-3.5 text-xs text-white focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 outline-none transition-all placeholder:text-slate-700 font-medium"
                      />
                      <Palette className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500/30" />
                    </div>
                    
                    <textarea 
                      placeholder="Special instructions for the scene creator..."
                      value={settings.productShot.customPrompt || ''}
                      onChange={(e) => updateProductPrompt(e.target.value)}
                      className="w-full bg-slate-950/40 border border-slate-800/50 rounded-2xl px-5 py-3 text-[10px] text-slate-300 focus:border-teal-500/30 outline-none h-16 resize-none placeholder:text-slate-700"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center p-8 bg-slate-900/20 border-2 border-dashed border-slate-800/50 rounded-3xl text-center">
                <Camera className="w-12 h-12 text-slate-700 mb-4 animate-pulse" />
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Select a Product Feature</h3>
                <p className="text-[10px] text-slate-600 mt-2 font-bold uppercase tracking-widest leading-relaxed">Choose a transformation style to see available presets and options.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Grid of Features */}
      <div className="space-y-8">
        {PRODUCT_SHOT_FEATURES.map((category) => (
          <div key={category.category} className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <div className="h-[1px] flex-1 bg-slate-900" />
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">{category.category}</h4>
              <div className="h-[1px] flex-1 bg-slate-900" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {category.items.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => handleFeatureSelect(btn.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-5 rounded-2xl border transition-all gap-3 group/btn relative overflow-hidden",
                    settings.productShot?.activeFeature === btn.id
                      ? "bg-teal-500/10 border-teal-500 shadow-xl shadow-teal-500/10 scale-[1.02]"
                      : "bg-slate-900/40 border-slate-800/50 text-slate-500 hover:border-slate-700 hover:bg-slate-800/80 hover:scale-[1.02]"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-xl transition-colors",
                    settings.productShot?.activeFeature === btn.id ? "bg-teal-500/20" : "bg-slate-950/50 group-hover/btn:bg-slate-900"
                  )}>
                    {(() => {
                      const Icon = PRODUCT_SHOT_ICONS[btn.icon as string] || Box;
                      return <Icon className={cn("w-5 h-5", settings.productShot?.activeFeature === btn.id ? "text-teal-400" : btn.color)} />;
                    })()}
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-tight text-center leading-tight max-w-[100px]",
                    settings.productShot?.activeFeature === btn.id ? "text-white" : "text-slate-400"
                  )}>
                    {btn.label}
                  </span>
                  
                  {/* Subtle hover effect */}
                  <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
