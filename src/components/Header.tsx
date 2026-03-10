import React from 'react';
import { Youtube, PlayCircle, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  view: 'ideas' | 'production';
  setView: (view: 'ideas' | 'production') => void;
  playAudio: (text: string) => void;
  audioLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ view, setView, playAudio, audioLoading }) => {
  return (
    <header className="glass sticky top-0 z-50 px-8 py-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-2xl text-white shadow-xl shadow-orange-500/20 transform hover:rotate-6 transition-transform">
            <Youtube size={32} fill="currentColor" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-zinc-900 tracking-tighter">جولة <span className="text-orange-500">Jawla</span></h1>
              <div className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Pro</div>
            </div>
            <p className="text-sm text-zinc-500 font-bold">مساعدك الذكي لإنتاج محتوى المصانع</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <motion.a 
            href="https://m.youtube.com/@JawlaOfflcial"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-3 rounded-2xl text-sm font-black transition-all shadow-lg shadow-zinc-900/10"
          >
            <PlayCircle size={18} className="text-orange-400" />
            اسمع شرح الموقع
          </motion.a>
          
          {view === 'production' && (
            <motion.button 
              onClick={() => setView('ideas')}
              whileHover={{ scale: 1.05, x: 4 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-black transition-colors group"
            >
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              العودة للأفكار
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};
