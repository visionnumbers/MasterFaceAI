import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  previewUrl: string | null;
  isDark: boolean;
}

export function Dropzone({ onFileSelect, selectedFile, previewUrl, isDark }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      id="dropzone-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-2xl p-4 flex flex-col h-48 transition-all overflow-hidden border",
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm",
        isDragging ? (isDark ? "border-teal-500 bg-slate-800" : "border-teal-500 bg-teal-50") : ""
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="image/*"
        className="hidden"
      />

      <span className="absolute top-3 right-3 z-10 px-2 py-0.5 bg-teal-500 text-[10px] font-bold text-slate-950 rounded uppercase tracking-tighter shadow-sm">
        Reference
      </span>

      <div 
        className={cn(
          "flex-1 rounded-xl overflow-hidden border group cursor-pointer",
          isDark ? "bg-slate-800 border-slate-700/50" : "bg-slate-100 border-slate-200"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={cn(
          "w-full h-full flex items-center justify-center relative",
          isDark ? "bg-gradient-to-br from-slate-700 to-slate-900" : "bg-slate-100"
        )}>
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Reference" 
              className="w-full h-full object-cover transition-transform group-hover:scale-105" 
            />
          ) : (
            <div className={cn(
              "w-24 h-24 rounded-full border-4 overflow-hidden flex items-center justify-center transition-all",
              isDark ? "border-slate-700 text-slate-500 bg-slate-800/50 group-hover:border-teal-500/30" : "border-slate-200 text-slate-400 bg-white group-hover:border-teal-500/30"
            )}>
              <Upload className="w-10 h-10" />
            </div>
          )}
          
          {selectedFile && (
            <button
              id="clear-image-btn"
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null as any);
              }}
              className={cn(
                "absolute top-2 left-2 px-3 py-1.5 border backdrop-blur rounded-lg flex items-center gap-2 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl z-20 group/clear",
                isDark ? "bg-slate-950/90 border-slate-700" : "bg-white/90 border-slate-200"
              )}
            >
              <X className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest group-hover/clear:block">Remove</span>
            </button>
          )}
        </div>
      </div>
      
      <p className="text-[10px] mt-2 text-center text-slate-500 italic">
        {selectedFile ? "Identity perfectly locked (100% preservation)" : "Upload one photo to lock identity"}
      </p>
    </div>
  );
}
