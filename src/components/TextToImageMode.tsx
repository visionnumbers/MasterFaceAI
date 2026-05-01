import React, { useState } from 'react';
import { 
  Sparkles, Upload, Trash2, Wand2, Image as ImageIcon, 
  User, Palette, Loader2, Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { TextToImageSettings } from '../types';
import { cn, fileToBase64 } from '../lib/utils';
import { enhancePromptWithReferences, clearFaceCache, clearStyleCache } from '../services/geminiService';

interface TextToImageModeProps {
  settings: TextToImageSettings;
  onSettingsChange: (settings: TextToImageSettings) => void;
  onGenerate: () => void;
  count: number;
  isGenerating: boolean;
  cooldownTime: number;
}

export function TextToImageMode({ 
  settings, 
  onSettingsChange, 
  onGenerate,
  count,
  isGenerating,
  cooldownTime
}: TextToImageModeProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [facePreview, setFacePreview] = useState<string | null>(
    settings.faceReference ? URL.createObjectURL(settings.faceReference) : null
  );
  const [stylePreview, setStylePreview] = useState<string | null>(
    settings.styleReference ? URL.createObjectURL(settings.styleReference) : null
  );

  const handleFaceUpload = async (file: File | null) => {
    let faceBase64: string | undefined;
    if (file) {
      faceBase64 = await fileToBase64(file);
      setFacePreview(URL.createObjectURL(file));
    } else {
      setFacePreview(null);
      clearFaceCache();
    }
    onSettingsChange({ ...settings, faceReference: file, faceBase64 });
  };

  const handleStyleUpload = async (file: File | null) => {
    let styleBase64: string | undefined;
    if (file) {
      styleBase64 = await fileToBase64(file);
      setStylePreview(URL.createObjectURL(file));
    } else {
      setStylePreview(null);
      clearStyleCache();
    }
    onSettingsChange({ ...settings, styleReference: file, styleBase64 });
  };

  const handleEnhancePrompt = async () => {
    if (!settings.prompt.trim() || isEnhancing) return;
    
    setIsEnhancing(true);
    try {
      const faceBase64 = settings.faceReference ? await fileToBase64(settings.faceReference) : undefined;
      const styleBase64 = settings.styleReference ? await fileToBase64(settings.styleReference) : undefined;
      
      const enhanced = await enhancePromptWithReferences(
        settings.prompt,
        faceBase64,
        styleBase64
      );
      
      onSettingsChange({ ...settings, prompt: enhanced });
    } catch (error) {
      console.error("Failed to enhance prompt:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <ImageIcon className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter italic">
            Text to Image
          </h2>
        </div>
        <p className="text-slate-400 text-base font-medium max-w-xl leading-relaxed">
          Transform your descriptions into stunning visuals. Use references to lock identity or artistic style.
        </p>
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />
        
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-blue-500 uppercase tracking-[3px] block px-1">
              Your Vision
            </label>
            <textarea
              value={settings.prompt}
              onChange={(e) => onSettingsChange({ ...settings, prompt: e.target.value })}
              placeholder="Describe the image you want to create... (simple or very detailed)"
              className="w-full h-40 bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-white text-lg placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all resize-none font-medium leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Face Reference */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] block px-1 flex items-center gap-2">
                <User className="w-3 h-3" />
                Face Reference (Optional – Identity Lock)
              </label>
              <div 
                className={cn(
                  "relative aspect-video rounded-2xl border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center overflow-hidden group/box",
                  facePreview 
                    ? "border-blue-500/50 bg-blue-500/10" 
                    : "border-white/5 bg-white/[0.02] hover:border-blue-500/30 hover:bg-white/[0.04]"
                )}
              >
                {facePreview ? (
                  <>
                    <img 
                      src={facePreview} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/box:scale-110"
                      alt="Face Ref"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/box:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                      <button 
                        onClick={() => handleFaceUpload(null)}
                        className="p-3 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-xl transition-all hover:scale-110"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 text-slate-600 mb-2 mx-auto group-hover/box:text-blue-400 transition-colors" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Click to upload Face</p>
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleFaceUpload(e.target.files?.[0] || null)}
                      accept="image/*"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Style Reference */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] block px-1 flex items-center gap-2">
                <Palette className="w-3 h-3" />
                Style Reference (Optional – Artistic Style)
              </label>
              <div 
                className={cn(
                  "relative aspect-video rounded-2xl border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center overflow-hidden group/box",
                  stylePreview 
                    ? "border-purple-500/50 bg-purple-500/10" 
                    : "border-white/5 bg-white/[0.02] hover:border-purple-500/30 hover:bg-white/[0.04]"
                )}
              >
                {stylePreview ? (
                  <>
                    <img 
                      src={stylePreview} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/box:scale-110"
                      alt="Style Ref"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/box:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                      <button 
                        onClick={() => handleStyleUpload(null)}
                        className="p-3 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-xl transition-all hover:scale-110"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 text-slate-600 mb-2 mx-auto group-hover/box:text-purple-400 transition-colors" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Click to upload Style</p>
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleStyleUpload(e.target.files?.[0] || null)}
                      accept="image/*"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleEnhancePrompt}
              disabled={!settings.prompt.trim() || isEnhancing || isGenerating}
              className="flex-1 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 group active:scale-95 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
            >
              {isEnhancing ? (
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              ) : (
                <Wand2 className="w-6 h-6 text-blue-400 group-hover:scale-125 group-hover:rotate-12 transition-transform" />
              )}
              <span className="tracking-tight text-lg">
                {isEnhancing ? 'Enhancing with AI...' : 'Enhance Prompt'}
              </span>
            </button>

            <button
              onClick={onGenerate}
              disabled={!settings.prompt.trim() || isGenerating || cooldownTime > 0}
              className="flex-[1.5] py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/25 group active:scale-95 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
            >
              {isGenerating ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Sparkles className="w-6 h-6 group-hover:scale-125 group-hover:rotate-12 transition-transform" />
              )}
              <span className="tracking-tight text-lg">
                {isGenerating ? 'Rendering Magic...' : cooldownTime > 0 ? `Please wait ${cooldownTime}s` : `Generate ${count} ${count === 1 ? 'Variant' : 'Variants'}`}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-300 font-medium leading-relaxed">
            <span className="font-bold text-blue-200">Pro Tip: </span>
            The <span className="font-bold text-blue-200">Enhance Prompt</span> button uses Gemini to turn your simple idea into a masterpiece by analyzing your uploaded face and style references for optimal character consistency.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
