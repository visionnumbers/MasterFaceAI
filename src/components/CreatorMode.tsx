import React, { useState } from 'react';
import { 
  Zap, Layers, Palette, Smartphone, Camera, Box, BookOpen, Sun, 
  BadgeCheck, Trash2, Upload, Sparkles, ChevronRight, ArrowLeft,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CREATOR_TOOLS, ILLUSTRATOR_STYLES } from '../constants';
import { CreatorSettings, CreatorTool } from '../types';
import { cn } from '../lib/utils';

interface CreatorModeProps {
  settings: CreatorSettings;
  onSettingsChange: (settings: CreatorSettings) => void;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onGenerate: () => void;
  count: number;
  isGenerating: boolean;
  cooldownTime: number;
}

export function CreatorMode({ 
  settings, 
  onSettingsChange, 
  selectedFile, 
  onFileSelect,
  onGenerate,
  count,
  isGenerating,
  cooldownTime
}: CreatorModeProps) {
  const [localClicked, setLocalClicked] = useState(false);
  const [activeTool, setActiveTool] = useState<CreatorTool | null>(
    CREATOR_TOOLS.find(t => t.id === settings.activeToolId) || null
  );

  // Reset local clicked state when isGenerating becomes false
  React.useEffect(() => {
    if (!isGenerating) {
      setLocalClicked(false);
    }
  }, [isGenerating]);

  const handleToolSelect = (tool: CreatorTool) => {
    setActiveTool(tool);
    onSettingsChange({
      ...settings,
      activeToolId: tool.id
    });
  };

  const handleInputChange = (field: string, value: string) => {
    onSettingsChange({
      ...settings,
      inputs: {
        ...settings.inputs,
        [field]: value
      }
    });
  };

  const selectedTool = activeTool;

  if (selectedTool) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <button 
          onClick={() => setActiveTool(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Creator Tools
        </button>

        <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className={cn("p-3 rounded-xl bg-white/5", selectedTool.color)}>
            {React.createElement(
              selectedTool.id === 'logo' ? Zap : 
              selectedTool.id === 'frame' ? Layers :
              selectedTool.id === 'pattern' ? Palette :
              selectedTool.id === 'social-post' ? Smartphone :
              selectedTool.id === 'youtube-thumb' ? Camera :
              selectedTool.id === 'pinterest' ? Box :
              selectedTool.id === 'poster' ? Layers :
              selectedTool.id === 'sticker' ? Zap :
              selectedTool.id === 'greetings' ? Zap :
              selectedTool.id === 'visiting-card' ? BadgeCheck :
              selectedTool.id === 'invite-card' ? Zap :
              selectedTool.id === 'clip-art' ? Layers :
              selectedTool.id === 'coloring-page' ? BookOpen :
              selectedTool.id === 'book-cover' ? BookOpen :
              selectedTool.id === 'wall-art' ? Sun :
              selectedTool.id === 'adv-creative' ? Zap : Palette,
              { className: "w-6 h-6" }
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">{selectedTool.label}</h3>
            <p className="text-sm text-slate-400">{selectedTool.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Side: Optional Reference */}
          <div className="space-y-4">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Optional Reference Image
            </label>
            <div 
              className={cn(
                "relative aspect-square rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden",
                selectedFile 
                  ? "border-indigo-500/50 bg-indigo-500/5" 
                  : "border-white/10 bg-white/5 hover:border-white/20"
              )}
            >
              {selectedFile ? (
                <>
                  <img 
                    src={URL.createObjectURL(selectedFile)} 
                    className="w-full h-full object-cover"
                    alt="Reference"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      onClick={() => onFileSelect(null)}
                      className="p-3 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-full transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-8 h-8 text-slate-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-300">Reference (Optional)</p>
                    <p className="text-[10px] text-slate-500">Add an image to guide the style</p>
                  </div>
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onFileSelect(file);
                    }}
                    accept="image/*"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="space-y-4">
            {selectedTool.placeholders.mainText && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                  Primary Text / Topic
                </label>
                <input 
                  type="text"
                  placeholder={selectedTool.placeholders.mainText}
                  value={settings.inputs.mainText || ''}
                  onChange={(e) => handleInputChange('mainText', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            )}

            {selectedTool.placeholders.brandName && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                  Brand / Author Name
                </label>
                <input 
                  type="text"
                  placeholder={selectedTool.placeholders.brandName}
                  value={settings.inputs.brandName || ''}
                  onChange={(e) => handleInputChange('brandName', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            )}

            {selectedTool.placeholders.tagline && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                  Tagline / Subtext
                </label>
                <input 
                  type="text"
                  placeholder={selectedTool.placeholders.tagline}
                  value={settings.inputs.tagline || ''}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            )}

            {selectedTool.id === 'illustrator' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                  Illustration Style
                </label>
                <select 
                  value={settings.inputs.style || ''}
                  onChange={(e) => handleInputChange('style', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors appearance-none"
                >
                  <option value="" className="bg-slate-900 italic">Select Style...</option>
                  {ILLUSTRATOR_STYLES.map(style => (
                    <option key={style} value={style} className="bg-slate-900">{style}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedTool.placeholders.description && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                  Details / Aesthetic
                </label>
                <textarea 
                  placeholder={selectedTool.placeholders.description}
                  value={settings.inputs.description || ''}
                  rows={2}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                />
              </div>
            )}

            {selectedTool.placeholders.colors && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                  Preferred Colors
                </label>
                <input 
                  type="text"
                  placeholder={selectedTool.placeholders.colors}
                  value={settings.inputs.colors || ''}
                  onChange={(e) => handleInputChange('colors', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                Custom Instructions
              </label>
              <textarea 
                placeholder="Any additional specific requests..."
                value={settings.customPrompt || ''}
                rows={2}
                onChange={(e) => onSettingsChange({ ...settings, customPrompt: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
              />
            </div>

            <button
              onClick={() => {
                if (localClicked || isGenerating || cooldownTime > 0) return;
                setLocalClicked(true);
                onGenerate();
              }}
              disabled={localClicked || isGenerating || cooldownTime > 0}
              className={cn(
                "w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20 group cursor-pointer",
                (localClicked || isGenerating || cooldownTime > 0) && "opacity-50 cursor-not-allowed"
              )}
            >
              {isGenerating || localClicked ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
              )}
              {isGenerating || localClicked ? (
                "Creating Assets..."
              ) : cooldownTime > 0 ? (
                `Wait ${cooldownTime}s`
              ) : (
                `Generate ${count} ${count === 1 ? 'Variant' : 'Variants'}`
              )}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          Creator Mode
        </h2>
        <p className="text-slate-400 text-sm">Professional AI creation tools for content creators and brands.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
        {CREATOR_TOOLS.map((tool, index) => (
          <motion.button
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleToolSelect(tool)}
            className="group relative flex flex-col p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all text-left overflow-hidden cursor-pointer"
          >
            <div className={cn("p-3 rounded-xl bg-white/5 mb-4 group-hover:scale-110 transition-transform inline-flex", tool.color)}>
              {React.createElement(
                tool.id === 'logo' ? Zap : 
                tool.id === 'frame' ? Layers :
                tool.id === 'pattern' ? Palette :
                tool.id === 'social-post' ? Smartphone :
                tool.id === 'youtube-thumb' ? Camera :
                tool.id === 'pinterest' ? Box :
                tool.id === 'poster' ? Layers :
                tool.id === 'sticker' ? Zap :
                tool.id === 'greetings' ? Zap :
                tool.id === 'visiting-card' ? BadgeCheck :
                tool.id === 'invite-card' ? Zap :
                tool.id === 'clip-art' ? Layers :
                tool.id === 'coloring-page' ? BookOpen :
                tool.id === 'book-cover' ? BookOpen :
                tool.id === 'wall-art' ? Sun :
                tool.id === 'adv-creative' ? Zap : Palette,
                { className: "w-5 h-5" }
              )}
            </div>
            
            <h4 className="font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
              {tool.label}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
              {tool.description}
            </p>

            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
