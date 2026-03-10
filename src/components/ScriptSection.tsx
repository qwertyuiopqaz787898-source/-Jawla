import React from 'react';
import { FileText, Volume2, VolumeX, RefreshCw, Loader2, Edit3, Check, Play, Square } from 'lucide-react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ScriptSectionProps {
  script: string;
  setScript: (script: string) => void;
  isEditingScript: boolean;
  setIsEditingScript: (isEditing: boolean) => void;
  loadingScript: boolean;
  fetchScript: () => void;
  playAudio: (text: string) => void;
  audioLoading: boolean;
  isPlaying: boolean;
}

export const ScriptSection: React.FC<ScriptSectionProps> = ({
  script,
  setScript,
  isEditingScript,
  setIsEditingScript,
  loadingScript,
  fetchScript,
  playAudio,
  audioLoading,
  isPlaying
}) => {
  return (
    <section id="script-section" className="bg-white border border-zinc-100 rounded-[3rem] shadow-xl overflow-hidden group/section">
      <div className="px-10 py-8 border-b border-zinc-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-50/30">
        <div className="flex items-center gap-5">
          <div className="bg-blue-500 p-3.5 rounded-2xl text-white shadow-lg shadow-blue-500/20">
            <FileText size={28} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-zinc-900 tracking-tight">السكريبت الاحترافي</h3>
            <p className="text-zinc-500 font-bold text-sm">محتوى مخصص لمدة 10-15 دقيقة</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button 
            onClick={() => setIsEditingScript(!isEditingScript)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "px-6 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 shadow-sm",
              isEditingScript 
                ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20" 
                : "bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200"
            )}
          >
            {isEditingScript ? <Check size={18} /> : <Edit3 size={18} />}
            {isEditingScript ? "حفظ التغييرات" : "تعديل النص"}
          </motion.button>
          
          <motion.button 
            onClick={() => playAudio(script)}
            disabled={loadingScript || !script || audioLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "px-6 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 shadow-sm disabled:opacity-50",
              isPlaying 
                ? "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20" 
                : "bg-zinc-900 text-white hover:bg-zinc-800"
            )}
          >
            {audioLoading ? <Loader2 className="animate-spin" size={18} /> : isPlaying ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            {isPlaying ? "إيقاف الاستماع" : "استمع للسكريبت"}
          </motion.button>
          
          <motion.button 
            onClick={fetchScript}
            disabled={loadingScript || isEditingScript}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-30"
            title="إعادة توليد السكريبت"
          >
            <RefreshCw size={20} className={loadingScript ? "animate-spin" : ""} />
          </motion.button>
        </div>
      </div>
      
      <div className="p-12">
        {loadingScript ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-black text-zinc-900">جاري صياغة السكريبت...</p>
              <p className="text-zinc-400 font-bold">نستخدم أفضل أساليب السرد القصصي لليوتيوب</p>
            </div>
          </div>
        ) : isEditingScript ? (
          <div className="relative">
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="w-full h-[700px] p-10 bg-zinc-50/50 border-2 border-zinc-100 rounded-[2.5rem] font-mono text-xl leading-relaxed focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none resize-none transition-all"
              placeholder="اكتب أو عدل السكريبت هنا..."
              dir="rtl"
            />
            <div className="absolute bottom-6 left-6 bg-white px-4 py-2 rounded-xl border border-zinc-200 text-xs font-black text-zinc-400 uppercase tracking-widest">
              Editor Mode
            </div>
          </div>
        ) : (
          <div className="markdown-body prose prose-zinc max-w-none prose-xl prose-p:text-zinc-600 prose-headings:text-zinc-900 prose-strong:text-zinc-900">
            <Markdown>{script}</Markdown>
          </div>
        )}
      </div>
    </section>
  );
};
