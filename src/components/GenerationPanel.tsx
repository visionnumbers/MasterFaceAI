import { useState } from 'react';
import { 
  User, UserCheck, ChevronDown, Wand2, 
  Settings2, Lightbulb, Grid, Smile, 
  Sparkles, Briefcase, Camera, Palette, Globe, 
  Ghost, Aperture, Zap, CheckCircle2, Layers, Move, Ban
} from 'lucide-react';
import { GenerationSettings, Category, Gender, ShotRange } from '../types';
import { CATEGORIES, SHOT_RANGES } from '../constants';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface GenerationPanelProps {
  settings: GenerationSettings;
  setSettings: (settings: GenerationSettings) => void;
  onGenerate: () => void;
  disabled: boolean;
  isGenerating: boolean;
  error: string | null;
  phase: string;
  cooldownTime: number;
  isStylesOpen: boolean;
  setIsStylesOpen: (open: boolean) => void;
  isDark: boolean;
}

const ICON_MAP: Record<string, any> = {
  Briefcase, Camera, Palette, Globe, Smile, Zap, Ghost, Aperture, Grid
};

export function GenerationPanel({ settings, setSettings, onGenerate, disabled, isGenerating, error, phase, cooldownTime, isStylesOpen, setIsStylesOpen, isDark }: GenerationPanelProps) {
  const [openCategory, setOpenCategory] = useState<string | null>('professional');

  const updateSetting = (key: keyof GenerationSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const isReferenceMode = settings.mode === 'reference';

  return (
    <div className={`w-full min-h-full ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} border-r flex flex-col p-5 gap-6 transition-colors duration-300 overflow-y-auto custom-scrollbar h-full`}>
      <div className="flex-1 space-y-6">
        {/* Mode Selector */}
        <div className="space-y-3">
          <label className={`text-[11px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'} font-bold`}>Generation Mode</label>
          <div className={`flex flex-col gap-2 p-1.5 ${isDark ? 'bg-slate-950/50' : 'bg-slate-200/50'} rounded-xl border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <button
              onClick={() => updateSetting('mode', 'built-in')}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all",
                settings.mode === 'built-in' 
                  ? "bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 scale-[1.02]" 
                  : isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Palette className="w-4 h-4" />
              <span>Built-in Styles</span>
              {settings.mode === 'built-in' && <CheckCircle2 className="w-3.5 h-3.5 ml-auto opacity-70" />}
            </button>
            <button
              onClick={() => updateSetting('mode', 'reference')}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all",
                settings.mode === 'reference' 
                  ? "bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 scale-[1.02]" 
                  : isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Camera className="w-4 h-4" />
              <span>Style Reference</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-slate-800 text-teal-400 rounded-full font-black uppercase tracking-tighter">Ref</span>
              {settings.mode === 'reference' && <CheckCircle2 className="w-3.5 h-3.5 ml-auto opacity-70" />}
            </button>
            <button
              onClick={() => updateSetting('mode', 'smart-edit')}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all",
                settings.mode === 'smart-edit' 
                  ? "bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 scale-[1.02]" 
                  : isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Wand2 className="w-4 h-4" />
              <span>Smart Edit</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-teal-500/20 text-teal-400 rounded-full font-black uppercase tracking-tighter border border-teal-500/20">AI</span>
              {settings.mode === 'smart-edit' && <CheckCircle2 className="w-3.5 h-3.5 ml-auto opacity-70" />}
            </button>
            <button
              onClick={() => updateSetting('mode', 'extractor')}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all",
                settings.mode === 'extractor' 
                  ? "bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 scale-[1.02]" 
                  : isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Sparkles className="w-4 h-4" />
              <span>Prompt Extractor</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded-full font-black uppercase tracking-tighter border border-purple-500/20">Vision</span>
              {settings.mode === 'extractor' && <CheckCircle2 className="w-3.5 h-3.5 ml-auto opacity-70" />}
            </button>
          </div>
        </div>

        {/* Gender & Shot Range */}
        <div className={cn("space-y-3 transition-all", (isReferenceMode || settings.mode === 'smart-edit' || settings.mode === 'extractor') && "opacity-40 grayscale pointer-events-none")}>
          <label className={`text-[11px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'} font-bold`}>Identity Settings</label>
          <div className={`flex gap-1 p-1 ${isDark ? 'bg-slate-950' : 'bg-slate-200'} rounded-lg`}>
            {(['male', 'female'] as Gender[]).map((g) => (
              <button
                id={`gender-${g}`}
                key={g}
                onClick={() => updateSetting('gender', g)}
                disabled={isReferenceMode || settings.mode === 'extractor'}
                className={cn(
                  "flex-1 py-1.5 text-xs rounded font-medium transition-all",
                  settings.gender === g 
                    ? isDark ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                    : isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
          <select
            id="shot-range-select"
            value={settings.shotRange}
            onChange={(e) => updateSetting('shotRange', e.target.value)}
            disabled={settings.mode === 'extractor'}
            className={`w-full ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'} border rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-500 transition-colors`}
          >
            {SHOT_RANGES.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Style selection */}
        <div id="styles-section" className={cn("space-y-3 transition-opacity", (isReferenceMode || settings.mode === 'smart-edit' || settings.mode === 'extractor') && "opacity-0 invisible pointer-events-none h-0 overflow-hidden")}>
          <button 
            onClick={() => setIsStylesOpen(!isStylesOpen)}
            className="w-full flex items-center justify-between group cursor-pointer"
          >
            <label className={`text-[11px] uppercase tracking-wider ${isDark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'} font-bold transition-colors pointer-events-none`}>Style Selection</label>
            <ChevronDown className={cn("w-3 h-3 text-slate-500 transition-transform", isStylesOpen && "rotate-180")} />
          </button>
          
          <AnimatePresence>
            {isStylesOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 mt-2">
                  {CATEGORIES.map((category) => {
                    const isOpen = openCategory === category.id;
                    
                    return (
                      <div key={category.id} className={cn(
                        "rounded-lg overflow-hidden transition-all",
                        isOpen 
                          ? isDark ? "bg-slate-800/50" : "bg-slate-100"
                          : isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
                      )}>
                        <button
                          id={`category-${category.id}`}
                          onClick={() => setOpenCategory(isOpen ? null : category.id)}
                          className={cn(
                            "w-full px-3 py-2.5 flex justify-between items-center text-[11px] font-semibold transition-colors",
                            isOpen 
                              ? "text-teal-500 border-b border-slate-700/50" 
                              : isDark ? "text-slate-400" : "text-slate-500"
                          )}
                        >
                          <span>{category.name}</span>
                          <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
                        </button>
                        
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-2 grid grid-cols-2 gap-1.5">
                                {category.styles.map((style) => (
                                  <button
                                    id={`style-${style.id}`}
                                    key={style.id}
                                    onClick={() => updateSetting('styleId', style.id)}
                                    className={cn(
                                      "p-2 text-[10px] rounded border transition-all text-left",
                                      settings.styleId === style.id 
                                        ? isDark 
                                          ? "bg-teal-500/10 border-teal-500/30 text-teal-300" 
                                          : "bg-teal-50/50 border-teal-500/40 text-teal-700"
                                        : isDark 
                                          ? "bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500" 
                                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
                                    )}
                                  >
                                    {style.name}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
