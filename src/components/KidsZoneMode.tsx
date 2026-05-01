import React, { useState } from 'react';
import { 
  Grid, Eye, Ghost, Type, ArrowRight, Box, CheckCircle2, 
  Palette, Sparkles, Search, PenTool, Plus, BookOpen, Layers,
  Trash2, Upload, ArrowLeft, Loader2, ChevronRight, Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { KIDS_ACTIVITIES } from '../constants';
import { KidsActivitySettings, KidsActivity } from '../types';
import { cn } from '../lib/utils';

interface KidsZoneModeProps {
  settings: KidsActivitySettings;
  onSettingsChange: (settings: KidsActivitySettings) => void;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onGenerate: () => void;
  count: number;
  isGenerating: boolean;
  cooldownTime: number;
}

export function KidsZoneMode({ 
  settings, 
  onSettingsChange, 
  selectedFile, 
  onFileSelect,
  onGenerate,
  count,
  isGenerating,
  cooldownTime
}: KidsZoneModeProps) {
  const [activeActivity, setActiveActivity] = useState<KidsActivity | null>(
    KIDS_ACTIVITIES.find(a => a.id === settings.activeActivityId) || null
  );
  const [localClicked, setLocalClicked] = useState(false);

  // Reset local clicked state when isGenerating becomes false
  React.useEffect(() => {
    if (!isGenerating) {
      setLocalClicked(false);
    }
  }, [isGenerating]);

  const handleActivitySelect = (activity: KidsActivity) => {
    setActiveActivity(activity);
    onSettingsChange({
      ...settings,
      activeActivityId: activity.id
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

  const selectedActivity = activeActivity;

  const getIcon = (id: string, className?: string) => {
    switch (id) {
      case 'maze': return <Grid className={className} />;
      case 'spot-differences': return <Eye className={className} />;
      case 'shadow-matching': return <Ghost className={className} />;
      case 'crossword': return <Type className={className} />;
      case 'word-matching': return <ArrowRight className={className} />;
      case 'complete-word': return <Box className={className} />;
      case 'correct-spelling': return <CheckCircle2 className={className} />;
      case 'coloring-page': return <Palette className={className} />;
      case 'connect-dots': return <Sparkles className={className} />;
      case 'hidden-object': return <Search className={className} />;
      case 'tracing-sheet': return <PenTool className={className} />;
      case 'math-puzzle': return <Plus className={className} />;
      case 'storybook': return <BookOpen className={className} />;
      case 'memory-match': return <Layers className={className} />;
      default: return <Star className={className} />;
    }
  };

  if (selectedActivity) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <button 
          onClick={() => setActiveActivity(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-2 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Kids Activities
        </button>

        <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-white/10 rounded-2xl shadow-xl shadow-indigo-500/5">
          <div className={cn("p-4 rounded-2xl bg-white/5 shadow-inner", selectedActivity.color)}>
            {getIcon(selectedActivity.id, "w-8 h-8")}
          </div>
          <div>
            <h3 className="font-black text-2xl text-white tracking-tight">{selectedActivity.label}</h3>
            <p className="text-sm text-slate-400 font-medium">{selectedActivity.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side: Optional Reference */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] block px-1">
              Style Reference (Optional)
            </label>
            <div 
              className={cn(
                "relative aspect-square rounded-[2rem] border-4 border-dashed transition-all duration-500 flex flex-col items-center justify-center overflow-hidden group",
                selectedFile 
                  ? "border-indigo-500/50 bg-indigo-500/10 scale-[1.01]" 
                  : "border-white/5 bg-white/[0.02] hover:border-indigo-500/30 hover:bg-white/[0.04]"
              )}
            >
              {selectedFile ? (
                <>
                  <img 
                    src={URL.createObjectURL(selectedFile)} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt="Reference"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    <button 
                      onClick={() => onFileSelect(null)}
                      className="p-4 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-2xl transition-all hover:scale-110 active:scale-95"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 space-y-5">
                  <div className="w-20 h-20 bg-white/5 rounded-[1.5rem] flex items-center justify-center mx-auto mb-2 border border-white/10 group-hover:rotate-12 transition-transform duration-500 shadow-xl">
                    <Upload className="w-10 h-10 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-slate-200">Image Reference</p>
                    <p className="text-xs text-slate-500 max-w-[200px] mx-auto leading-relaxed">Optional: Upload an image to guide the artistic style of the activity.</p>
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
          <div className="space-y-5 bg-white/[0.03] p-6 rounded-[2rem] border border-white/5">
            {selectedActivity.fields.map(field => (
              <div key={field.id} className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] px-1 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-500" />
                  {field.label}
                </label>
                
                {field.type === 'select' ? (
                  <div className="relative group">
                    <select 
                      value={(settings.inputs as any)[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer hover:bg-white/[0.08]"
                    >
                      <option value="" className="bg-slate-900 italic">Select one...</option>
                      {field.options?.map(opt => (
                        <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none group-hover:translate-x-0.5 transition-transform" />
                  </div>
                ) : field.type === 'textarea' ? (
                  <textarea 
                    placeholder={field.placeholder}
                    value={(settings.inputs as any)[field.id] || ''}
                    rows={3}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all resize-none hover:bg-white/[0.08]"
                  />
                ) : (
                  <input 
                    type="text"
                    placeholder={field.placeholder}
                    value={(settings.inputs as any)[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all hover:bg-white/[0.08]"
                  />
                )}
              </div>
            ))}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] px-1 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-pink-500" />
                Custom Magic Instructions
              </label>
              <textarea 
                placeholder="Any special requests for the activity..."
                value={settings.customPrompt || ''}
                rows={2}
                onChange={(e) => onSettingsChange({ ...settings, customPrompt: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all resize-none hover:bg-white/[0.08]"
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
                "w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/25 group cursor-pointer active:scale-95",
                (localClicked || isGenerating || cooldownTime > 0) && "opacity-50 cursor-not-allowed grayscale pointer-events-none"
              )}
            >
              {isGenerating || localClicked ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Sparkles className="w-6 h-6 group-hover:scale-125 group-hover:rotate-12 transition-transform" />
              )}
              <span className="tracking-tight text-lg">
                {isGenerating || localClicked ? (
                  "Generating Adventure..."
                ) : cooldownTime > 0 ? (
                  `Wait ${cooldownTime}s`
                ) : (
                  `Generate ${count} ${count === 1 ? 'Activity' : 'Activities'}`
                )}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter italic">
            Kids Zone
          </h2>
        </div>
        <p className="text-slate-400 text-base font-medium max-w-xl leading-relaxed">
          Create magical, educational, and fun activities for children aged 3-10. Ready to print, play, and learn!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {KIDS_ACTIVITIES.map((activity, index) => (
          <motion.button
            key={activity.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, type: "spring", stiffness: 100 }}
            onClick={() => handleActivitySelect(activity)}
            className="group relative flex flex-col p-6 bg-white/[0.04] border border-white/5 rounded-[2rem] hover:bg-white/[0.08] hover:border-indigo-500/30 transition-all text-left overflow-hidden cursor-pointer shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 active:scale-[0.98]"
          >
            <div className={cn("p-4 rounded-2xl bg-white/5 mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 inline-flex shadow-inner", activity.color)}>
              {getIcon(activity.id, "w-6 h-6")}
            </div>
            
            <h4 className="font-black text-lg text-white mb-2 leading-tight group-hover:text-indigo-400 transition-colors">
              {activity.label}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              {activity.description}
            </p>

            <div className="absolute top-4 right-4 text-white/5 group-hover:text-indigo-500/20 transition-colors">
              <Star className="w-12 h-12" />
            </div>

            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
              <ChevronRight className="w-5 h-5 text-indigo-400" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
