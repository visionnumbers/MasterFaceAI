import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Sparkles, Wand2, RefreshCw, Copy, Check, Info } from 'lucide-react';
import { Dropzone } from './Dropzone';
import { extractImagePrompt } from '../services/geminiService';
import { fileToBase64, cn } from '../lib/utils';

interface ImagePromptExtractorProps {
  isDark: boolean;
  onGenerateVariations: (prompt: string, imageFile: File) => void;
  isGenerating: boolean;
  imageCount: number;
}

export function ImagePromptExtractor({ isDark, onGenerateVariations, isGenerating, imageCount }: ImagePromptExtractorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedPrompt, setExtractedPrompt] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      await handleExtract(file);
    } else {
      setPreviewUrl(null);
      setExtractedPrompt('');
      setError(null);
    }
  };

  const handleExtract = async (file: File) => {
    if (!file) return;
    setIsExtracting(true);
    setError(null);
    try {
      const base64 = await fileToBase64(file);
      const prompt = await extractImagePrompt(base64);
      setExtractedPrompt(prompt);
    } catch (err: any) {
      setError("Failed to extract prompt. Please try again.");
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 min-h-[400px]">
      {/* Upload Left */}
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-teal-500" />
            <span className="text-xs font-black uppercase tracking-[0.25em] text-white">Upload any image to extract detailed prompt</span>
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Our AI will deconstruct the visual DNA</span>
        </div>
        
        <div className="relative group h-[300px]">
          <Dropzone 
            onFileSelect={handleFileSelect} 
            selectedFile={selectedFile} 
            previewUrl={previewUrl}
            isDark={isDark}
            hideLabel={true}
          />
          {isExtracting && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-20 gap-3">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="w-8 h-8 text-teal-500" />
              </motion.div>
              <span className="text-[10px] font-black uppercase text-white tracking-[0.2em] animate-pulse">Extracting Vision Vectors...</span>
            </div>
          )}
        </div>
      </div>

      {/* Result Right */}
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-black uppercase tracking-[0.25em] text-white">Extracted Prompt</span>
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Refine the AI's interpretation below</span>
        </div>

        <div className={cn(
          "flex-1 relative rounded-2xl border flex flex-col overflow-hidden transition-all",
          isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200",
          !extractedPrompt && "opacity-50 grayscale"
        )}>
          <textarea 
            value={extractedPrompt}
            onChange={(e) => setExtractedPrompt(e.target.value)}
            placeholder={isExtracting ? "Synthesizing detailed analysis..." : "Prompt will appear here after upload..."}
            className="w-full flex-1 p-5 text-sm leading-relaxed bg-transparent outline-none resize-none custom-scrollbar"
            disabled={isExtracting || !selectedFile}
          />
          
          <div className={cn(
            "p-3 flex items-center justify-between border-t",
            isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
          )}>
            <div className="flex gap-2">
              <button
                disabled={!extractedPrompt || isExtracting}
                onClick={() => handleExtract(selectedFile!)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all disabled:opacity-50"
              >
                <RefreshCw className={cn("w-3 h-3", isExtracting && "animate-spin")} />
                Regenerate
              </button>
              <button
                disabled={!extractedPrompt}
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all disabled:opacity-50"
              >
                {copied ? <Check className="w-3 h-3 text-teal-500" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              {extractedPrompt.trim().split(/\s+/).length} Words
            </span>
          </div>
        </div>

        <button
          disabled={!extractedPrompt || isGenerating || isExtracting}
          onClick={() => onGenerateVariations(extractedPrompt, selectedFile!)}
          className={cn(
            "w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all",
            extractedPrompt && !isGenerating 
              ? "bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-xl shadow-teal-500/10" 
              : "bg-slate-800 text-slate-600 grayscale cursor-not-allowed"
          )}
        >
          <Wand2 className={cn("w-4 h-4", isGenerating && "animate-pulse")} />
          {isGenerating ? "Generating Variations..." : `Generate New Variations (x${imageCount})`}
        </button>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold text-center flex items-center justify-center gap-2"
            >
              <Info className="w-3 h-3" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
