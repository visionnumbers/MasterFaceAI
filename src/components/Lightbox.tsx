import { X, Download, Share2, ImageIcon } from 'lucide-react';
import { GeneratedImage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface LightboxProps {
  image: GeneratedImage | null;
  onClose: () => void;
}

export function Lightbox({ image, onClose }: LightboxProps) {
  const getAspectRatioClass = (ratio?: string) => {
    switch (ratio) {
      case '16:9': return 'aspect-video';
      case '9:16': return 'aspect-[9/16]';
      case '4:3': return 'aspect-[4/3]';
      case '3:4': return 'aspect-[3/4]';
      default: return 'aspect-square';
    }
  };

  const getContainerWidth = (ratio?: string) => {
    if (ratio === '9:16' || ratio === '3:4') return 'max-w-3xl';
    return 'max-w-5xl';
  };

  const getDimensions = (ratio?: string) => {
    if (!ratio) return '1024 x 1024';
    const cleanRatio = ratio.trim();
    switch (cleanRatio) {
      case '16:9': return '1536 x 864';
      case '9:16': return '816 x 1456';
      case '4:3': return '1232 x 928';
      case '3:4': return '928 x 1232';
      case '1:1': return '1024 x 1024';
      default: return '1024 x 1024';
    }
  };

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 overflow-y-auto"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={onClose} />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={cn(
              "relative w-full bg-gray-900 rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row md:max-h-[85vh] my-auto",
              getContainerWidth(image.ratio)
            )}
          >
            {/* Image Section */}
            <div className={cn(
              "flex-1 bg-black flex items-center justify-center relative overflow-hidden h-full",
              getAspectRatioClass(image.ratio)
            )}>
              <img
                src={image.url}
                alt={image.styleName}
                className="w-full h-full object-contain"
              />
              <button
                onClick={onClose}
                className="absolute top-6 left-6 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all md:hidden"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Sidebar Section */}
            <div className="w-full md:w-[350px] bg-gray-900 p-8 flex flex-col border-l border-white/5 overflow-y-auto custom-scrollbar">
              <div className="flex-1 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{image.styleName}</h2>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-mono">ID: {image.id}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="hidden md:flex w-10 h-10 bg-white/5 rounded-full items-center justify-center text-white hover:bg-white/10 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 max-h-48 overflow-y-auto custom-scrollbar">
                    <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-2">PROMPT DETAILS</p>
                    <p className="text-sm text-gray-300 leading-relaxed italic">"{image.prompt}"</p>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">DATE</p>
                      <p className="text-white text-xs font-mono">{new Date(image.timestamp).toLocaleDateString()}</p>
                    </div>
                    <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">DIMENSIONS</p>
                      <p className="text-white text-xs font-mono">{getDimensions(image.ratio)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-8 mt-auto shrink-0">
                <a
                  href={image.url}
                  download={`masterface-${image.id}.png`}
                  className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-900/20"
                >
                  <Download className="w-5 h-5" />
                  Download Image
                </a>
                <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
                  <Share2 className="w-5 h-5" />
                  Share Snapshot
                </button>
                <div className="flex items-center gap-2 justify-center pt-4">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">MasterFace AI Identity Core</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
