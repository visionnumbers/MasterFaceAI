import { Download, Maximize2, Share2, Trash2 } from 'lucide-react';
import { GeneratedImage } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ResultsGalleryProps {
  images: GeneratedImage[];
  onDelete: (id: string) => void;
  onOpenLightbox: (image: GeneratedImage) => void;
  isDark: boolean;
}

export function ResultsGallery({ images, onDelete, onOpenLightbox, isDark }: ResultsGalleryProps) {
  if (images.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 ${isDark ? 'text-slate-700' : 'text-slate-300'} grayscale opacity-50`}>
        <div className={`w-24 h-24 border-2 border-dashed ${isDark ? 'border-slate-800' : 'border-slate-200'} rounded-3xl flex items-center justify-center mb-6`}>
          <Download className="w-10 h-10" />
        </div>
        <p className={`text-xl font-medium ${isDark ? '' : 'text-slate-400'}`}>Your generated pictures will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      <AnimatePresence>
        {images.map((image) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`group relative aspect-square rounded-xl overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'} border shadow-lg`}
          >
            <img
              src={image.url}
              alt={image.styleName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 md:p-3">
              <div className="flex gap-2">
                <button
                  onClick={() => onOpenLightbox(image)}
                  className="flex-1 bg-slate-800 text-white p-1.5 text-[10px] rounded font-semibold hover:bg-slate-700 transition-colors"
                >
                  PREVIEW
                </button>
                <a
                  href={image.url}
                  download={`masterface-${image.id}.png`}
                  className="bg-teal-500 text-slate-950 p-1.5 px-3 text-[10px] rounded font-bold hover:bg-teal-400 transition-colors"
                >
                  GET
                </a>
              </div>
              <button
                onClick={() => onDelete(image.id)}
                className="absolute top-2 right-2 w-8 h-8 bg-slate-900/80 backdrop-blur rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            {/* Identity Status */}
            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-teal-500/10 border border-teal-500/20 rounded text-[8px] font-bold text-teal-400 backdrop-blur-sm">
              LOCKED
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
