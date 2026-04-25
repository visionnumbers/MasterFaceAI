import { Moon, Sun, Wand2 } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  onScrollToLibrary: () => void;
  onOpenStyles: () => void;
}

export function Header({ isDark, toggleTheme, onScrollToLibrary, onOpenStyles }: HeaderProps) {
  return (
    <header className={`h-16 border-b ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white/80'} flex items-center justify-between px-8 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300`}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-slate-950 font-bold">
          M
        </div>
        <span className={`text-xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          MasterFace <span className="text-teal-500">AI</span>
        </span>
      </div>
      <div className="flex items-center gap-6">
        <nav className={`flex gap-6 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`${isDark ? 'text-white' : 'text-slate-900'} hover:text-teal-500 transition-colors`}>Generator</a>
          <button onClick={onScrollToLibrary} className="hover:text-teal-500 transition-colors cursor-pointer">My Library</button>
          <button onClick={onOpenStyles} className="hover:text-teal-500 transition-colors cursor-pointer">Styles</button>
        </nav>
        <div className={`flex items-center gap-3 border-l ${isDark ? 'border-slate-700' : 'border-slate-200'} pl-6`}>
          <button 
            onClick={toggleTheme}
            className={`w-8 h-8 rounded-full ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} flex items-center justify-center transition-all shadow-sm`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 border border-white/20"></div>
        </div>
      </div>
    </header>
  );
}
