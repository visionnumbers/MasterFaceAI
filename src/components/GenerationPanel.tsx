import { useState } from 'react';
import { 
  User, UserCheck, ChevronDown, Wand2, 
  Settings2, Lightbulb, Grid, Smile, 
  Sparkles, Briefcase, Camera, Palette, Globe, 
  Ghost, Aperture, Zap, CheckCircle2, Layers, Move, Ban
} from 'lucide-react';
import { GenerationSettings, Category, Gender, ShotRange } from '../types';
import { CATEGORIES, SHOT_RANGES, LIGHTING_OPTIONS, BACKGROUND_OPTIONS, MOOD_OPTIONS, RATIO_OPTIONS, POSE_OPTIONS, BATCH_COUNTS, WEIGHT_OPTIONS, AGE_OPTIONS } from '../constants';
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
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const updateSetting = (key: keyof GenerationSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className={`w-full min-h-full ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} border-r flex flex-col p-5 gap-6 transition-colors duration-300 overflow-y-auto custom-scrollbar h-full`}>
      <div className="flex-1 space-y-6">
        {/* Gender & Shot Range */}
        <div className="space-y-3">
          <label className={`text-[11px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'} font-bold`}>Identity Settings</label>
          <div className={`flex gap-1 p-1 ${isDark ? 'bg-slate-950' : 'bg-slate-200'} rounded-lg`}>
            {(['male', 'female'] as Gender[]).map((g) => (
              <button
                id={`gender-${g}`}
                key={g}
                onClick={() => updateSetting('gender', g)}
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
            className={`w-full ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'} border rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-500 transition-colors`}
          >
            {SHOT_RANGES.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Style selection */}
        <div id="styles-section" className="space-y-3">
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

        {/* Advanced Settings */}
        <div className="space-y-3">
          <label className={`text-[11px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'} font-bold`}>Advanced Control</label>

          <div className={`space-y-4 p-4 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} border rounded-lg`}>
            {/* Batch Count */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Layers className="w-3 h-3" />
                <span className="text-[10px] uppercase font-bold tracking-tighter">Number of images</span>
              </div>
              <div className={`flex gap-1 ${isDark ? 'bg-slate-900' : 'bg-slate-100'} p-1 rounded-md`}>
                {BATCH_COUNTS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateSetting('count', c)}
                    className={cn(
                      "flex-1 py-1 text-[10px] rounded transition-all",
                      settings.count === c 
                        ? isDark ? "bg-slate-800 text-teal-400 shadow-sm" : "bg-white text-teal-600 shadow-sm" 
                        : "text-slate-500"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[10px]">
              {/* Weight control */}
              <div className="space-y-1">
                <span className="text-slate-500 uppercase font-bold tracking-tighter">Weight</span>
                <select 
                  value={WEIGHT_OPTIONS.slice(0, -1).includes(settings.weight) ? settings.weight : 'Custom'} 
                  onChange={(e) => updateSetting('weight', e.target.value === 'Custom' ? '' : e.target.value)}
                  className={`w-full ${isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'} border-none py-1 outline-none rounded`}
                >
                  {WEIGHT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {(!WEIGHT_OPTIONS.slice(0, -1).includes(settings.weight) || settings.weight === 'Custom') && (
                  <input 
                    type="text"
                    placeholder="Describe the change (e.g., more muscular)"
                    value={settings.weight === 'Custom' ? '' : settings.weight}
                    onChange={(e) => updateSetting('weight', e.target.value)}
                    className={`w-full mt-1 ${isDark ? 'bg-slate-800 text-slate-300 placeholder:text-slate-600' : 'bg-white text-slate-700 border-slate-200'} border rounded px-2 py-1 text-[9px] outline-none`}
                  />
                )}
              </div>

              {/* Age control */}
              <div className="space-y-1">
                <span className="text-slate-500 uppercase font-bold tracking-tighter">Age</span>
                <select 
                  value={AGE_OPTIONS.slice(0, -1).includes(settings.age) ? settings.age : 'Custom'} 
                  onChange={(e) => updateSetting('age', e.target.value === 'Custom' ? '' : e.target.value)}
                  className={`w-full ${isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'} border-none py-1 outline-none rounded`}
                >
                  {AGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {(!AGE_OPTIONS.slice(0, -1).includes(settings.age) || settings.age === 'Custom') && (
                  <input 
                    type="text"
                    placeholder="Describe the target age (e.g., 25 years old, middle-aged)"
                    value={settings.age === 'Custom' ? '' : settings.age}
                    onChange={(e) => updateSetting('age', e.target.value)}
                    className={`w-full mt-1 ${isDark ? 'bg-slate-800 text-slate-300 placeholder:text-slate-600' : 'bg-white text-slate-700 border-slate-200'} border rounded px-2 py-1 text-[9px] outline-none`}
                  />
                )}
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 uppercase font-bold tracking-tighter">Lighting</span>
                <select 
                  value={LIGHTING_OPTIONS.slice(0, -1).includes(settings.lighting) ? settings.lighting : 'Custom'} 
                  onChange={(e) => updateSetting('lighting', e.target.value === 'Custom' ? '' : e.target.value)}
                  className={`w-full ${isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'} border-none py-1 outline-none rounded`}
                >
                  {LIGHTING_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {(!LIGHTING_OPTIONS.slice(0, -1).includes(settings.lighting) || settings.lighting === 'Custom') && (
                  <input 
                    type="text"
                    placeholder="e.g. golden hour rim light"
                    value={settings.lighting === 'Custom' ? '' : settings.lighting}
                    onChange={(e) => updateSetting('lighting', e.target.value)}
                    className={`w-full mt-1 ${isDark ? 'bg-slate-800 text-slate-300 placeholder:text-slate-600' : 'bg-white text-slate-700 border-slate-200'} border rounded px-2 py-1 text-[9px] outline-none`}
                  />
                )}
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 uppercase font-bold tracking-tighter">Background</span>
                <select 
                  value={BACKGROUND_OPTIONS.slice(0, -1).includes(settings.background) ? settings.background : 'Custom'} 
                  onChange={(e) => updateSetting('background', e.target.value === 'Custom' ? '' : e.target.value)}
                  className={`w-full ${isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'} border-none py-1 outline-none rounded`}
                >
                  {BACKGROUND_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {(!BACKGROUND_OPTIONS.slice(0, -1).includes(settings.background) || settings.background === 'Custom') && (
                  <input 
                    type="text"
                    placeholder="e.g. mountains at sunset"
                    value={settings.background === 'Custom' ? '' : settings.background}
                    onChange={(e) => updateSetting('background', e.target.value)}
                    className={`w-full mt-1 ${isDark ? 'bg-slate-800 text-slate-300 placeholder:text-slate-600' : 'bg-white text-slate-700 border-slate-200'} border rounded px-2 py-1 text-[9px] outline-none`}
                  />
                )}
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 uppercase font-bold tracking-tighter">Mood</span>
                <select 
                  value={MOOD_OPTIONS.slice(0, -1).includes(settings.mood) ? settings.mood : 'Custom'} 
                  onChange={(e) => updateSetting('mood', e.target.value === 'Custom' ? '' : e.target.value)}
                  className={`w-full ${isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'} border-none py-1 outline-none rounded`}
                >
                  {MOOD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {(!MOOD_OPTIONS.slice(0, -1).includes(settings.mood) || settings.mood === 'Custom') && (
                  <input 
                    type="text"
                    placeholder="e.g. ecstatic happiness"
                    value={settings.mood === 'Custom' ? '' : settings.mood}
                    onChange={(e) => updateSetting('mood', e.target.value)}
                    className={`w-full mt-1 ${isDark ? 'bg-slate-800 text-slate-300 placeholder:text-slate-600' : 'bg-white text-slate-700 border-slate-200'} border rounded px-2 py-1 text-[9px] outline-none`}
                  />
                )}
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 uppercase font-bold tracking-tighter">Ratio</span>
                <select 
                  value={settings.ratio} 
                  onChange={(e) => updateSetting('ratio', e.target.value)}
                  className={`w-full ${isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'} border-none py-1 outline-none rounded`}
                >
                  {RATIO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-1 col-span-2">
                <span className="text-slate-500 uppercase font-bold tracking-tighter">Pose</span>
                <select 
                  value={POSE_OPTIONS.slice(0, -1).includes(settings.pose) ? settings.pose : 'Custom'} 
                  onChange={(e) => updateSetting('pose', e.target.value === 'Custom' ? '' : e.target.value)}
                  className={`w-full ${isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'} border-none py-1 outline-none rounded mb-1`}
                >
                  {POSE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {(!POSE_OPTIONS.slice(0, -1).includes(settings.pose) || settings.pose === 'Custom') && (
                  <input 
                    type="text"
                    placeholder="Describe the pose (e.g., hands crossed, confident stance)"
                    value={settings.pose === 'Custom' ? '' : settings.pose}
                    onChange={(e) => updateSetting('pose', e.target.value)}
                    className={`w-full ${isDark ? 'bg-slate-800 text-slate-300 placeholder:text-slate-600' : 'bg-white text-slate-700 border-slate-200'} border rounded px-2 py-1 text-[9px] outline-none focus:ring-1 focus:ring-teal-500/50`}
                  />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Quality Engine</span>
              <div className={`flex gap-1 ${isDark ? 'bg-slate-900' : 'bg-slate-100'} p-1 rounded-md`}>
                {(['standard', 'high', 'ultra'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => updateSetting('quality', q)}
                    className={cn(
                      "flex-1 py-1 text-[10px] rounded transition-all capitalize",
                      settings.quality === q 
                        ? isDark ? "bg-slate-800 text-teal-400 shadow-sm" : "bg-white text-teal-600 shadow-sm" 
                        : "text-slate-500"
                    )}
                  >
                    {q === 'ultra' ? '4K' : q.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Ban className="w-3 h-3" />
                <span className="text-[10px] uppercase font-bold tracking-tighter">Negative Prompt</span>
              </div>
              <input 
                type="text"
                placeholder="e.g. glasses, beard, red color"
                value={settings.negativePrompt}
                onChange={(e) => updateSetting('negativePrompt', e.target.value)}
                className={`w-full ${isDark ? 'bg-slate-900' : 'bg-slate-50'} border-none rounded p-2 text-[10px] text-slate-300 focus:ring-1 focus:ring-teal-500/50 outline-none`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className={`mt-auto pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} space-y-4`}>
        {(error || (isGenerating && phase)) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-3 rounded-lg text-[10px] font-bold leading-tight",
              error ? "bg-red-500/10 border border-red-500/30 text-red-400" : "bg-teal-500/10 border border-teal-500/30 text-teal-400"
            )}
          >
            {error || phase}
          </motion.div>
        )}
        
        <div className="relative group">
          <button
            id="generate-button"
            disabled={disabled || isGenerating}
            onClick={onGenerate}
            className={cn(
              "w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2",
              isGenerating && "opacity-80 cursor-not-allowed",
              disabled && "grayscale opacity-50 cursor-not-allowed"
            )}
          >
            {isGenerating ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Zap className="w-5 h-5 fill-current" />
              </motion.div>
            ) : (
              <Zap className="w-5 h-5 fill-current" />
            )}
            {isGenerating ? "Processing..." : cooldownTime > 0 ? `Wait ${cooldownTime}s` : "Generate Pictures"}
          </button>
        </div>
      </div>
    </div>
  );
}
