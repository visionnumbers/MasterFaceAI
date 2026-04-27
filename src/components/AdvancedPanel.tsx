import { 
  Settings, Ghost, Aperture, Zap, Layers, Move, Ban, Maximize2
} from 'lucide-react';
import { GenerationSettings } from '../types';
import { 
  LIGHTING_OPTIONS, 
  BACKGROUND_OPTIONS, 
  MOOD_OPTIONS, 
  RATIO_OPTIONS, 
  POSE_OPTIONS, 
  BATCH_COUNTS, 
  WEIGHT_OPTIONS, 
  AGE_OPTIONS 
} from '../constants';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface AdvancedPanelProps {
  settings: GenerationSettings;
  setSettings: (settings: GenerationSettings) => void;
  isDark: boolean;
}

export function AdvancedPanel({ settings, setSettings, isDark }: AdvancedPanelProps) {
  const isReferenceMode = settings.mode === 'reference';
  const isSmartEditMode = settings.mode === 'smart-edit';
  const isExtractorMode = settings.mode === 'extractor';

  const updateSetting = (key: keyof GenerationSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className={cn(
      "w-full min-h-full border-l flex flex-col p-5 gap-6 transition-all duration-500 overflow-y-auto custom-scrollbar h-full",
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
    )}>
      <div className="flex-1 space-y-6">
        <div className="space-y-3">
          <label className={`text-[11px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'} font-bold flex items-center gap-2`}>
            <Settings className="w-3 h-3" />
            Advanced Control
          </label>

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

            {(!isReferenceMode && !isSmartEditMode && !isExtractorMode) && (
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
                      placeholder="Describe the target age (e.g., 25 years old)"
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
                      placeholder="e.g. golden hour"
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
                      placeholder="e.g. office"
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
                      placeholder="e.g. confident"
                      value={settings.mood === 'Custom' ? '' : settings.mood}
                      onChange={(e) => updateSetting('mood', e.target.value)}
                      className={`w-full mt-1 ${isDark ? 'bg-slate-800 text-slate-300 placeholder:text-slate-600' : 'bg-white text-slate-700 border-slate-200'} border rounded px-2 py-1 text-[9px] outline-none`}
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 uppercase font-bold tracking-tighter">Pose</span>
                  <select 
                    value={POSE_OPTIONS.slice(0, -1).includes(settings.pose) ? settings.pose : 'Custom'} 
                    onChange={(e) => updateSetting('pose', e.target.value === 'Custom' ? '' : e.target.value)}
                    className={`w-full ${isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'} border-none py-1 outline-none rounded`}
                  >
                    {POSE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  {(!POSE_OPTIONS.slice(0, -1).includes(settings.pose) || settings.pose === 'Custom') && (
                    <input 
                      type="text"
                      placeholder="e.g. looking away"
                      value={settings.pose === 'Custom' ? '' : settings.pose}
                      onChange={(e) => updateSetting('pose', e.target.value)}
                      className={`w-full mt-1 ${isDark ? 'bg-slate-800 text-slate-300 placeholder:text-slate-600' : 'bg-white text-slate-700 border-slate-200'} border rounded px-2 py-1 text-[9px] outline-none focus:ring-1 focus:ring-teal-500/50`}
                    />
                  )}
                </div>
              </div>
            )}

            {(isReferenceMode || isSmartEditMode || isExtractorMode) && (
              <div className={cn(
                "p-3 rounded-lg border mb-2",
                isSmartEditMode ? "bg-purple-500/5 border-purple-500/10" : 
                isExtractorMode ? "bg-purple-500/5 border-purple-500/10" : 
                "bg-teal-500/5 border-teal-500/10"
              )}>
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-wider text-center",
                  (isSmartEditMode || isExtractorMode) ? "text-purple-600/80" : "text-teal-600/80"
                )}>
                   {isSmartEditMode 
                    ? "Smart Edit Mode Active: Overrides disabled to ensure clean attribute modification." 
                    : isExtractorMode 
                    ? "Prompt Extractor Mode Active: Uses visual analysis for style & scene generation."
                    : "Identity Locked. Style Fixed to Reference."}
                </p>
              </div>
            )}


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
                <span className="text-[10px] uppercase font-bold tracking-tighter">Exclusion Filters</span>
              </div>
              <textarea 
                placeholder="e.g. glasses, beard, red color"
                value={settings.negativePrompt}
                onChange={(e) => updateSetting('negativePrompt', e.target.value)}
                className={`w-full ${isDark ? 'bg-slate-900' : 'bg-slate-50'} border-none rounded p-2 text-[10px] text-slate-300 focus:ring-1 focus:ring-teal-500/50 outline-none h-16 resize-none`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
