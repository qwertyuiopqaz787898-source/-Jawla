import React from 'react';
import { Image as ImageIcon, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion } from 'motion/react';

interface ThumbnailSectionProps {
  thumbnailIdeas: string;
  loadingThumbnail: boolean;
  fetchThumbnail: () => void;
}

export const ThumbnailSection: React.FC<ThumbnailSectionProps> = ({
  thumbnailIdeas,
  loadingThumbnail,
  fetchThumbnail
}) => {
  return (
    <section id="thumbnail-section" className="bg-white border border-zinc-100 rounded-[3rem] shadow-xl overflow-hidden h-full flex flex-col">
      <div className="px-10 py-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
        <div className="flex items-center gap-5">
          <div className="bg-purple-500 p-3.5 rounded-2xl text-white shadow-lg shadow-purple-500/20">
            <ImageIcon size={28} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-zinc-900 tracking-tight">تصميم الغلاف</h3>
            <p className="text-zinc-500 font-bold text-sm">أفكار الصور المصغرة الجذابة</p>
          </div>
        </div>
        <motion.button 
          onClick={fetchThumbnail}
          disabled={loadingThumbnail}
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-purple-600 hover:border-purple-200 transition-all disabled:opacity-30"
        >
          <RefreshCw size={20} className={loadingThumbnail ? "animate-spin" : ""} />
        </motion.button>
      </div>
      
      <div className="p-12 flex-1">
        {loadingThumbnail ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="text-purple-500" size={24} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-black text-zinc-900">جاري التحليل...</p>
              <p className="text-zinc-400 font-bold">نحلل أكثر الصور المصغرة نجاحاً في مجالك</p>
            </div>
          </div>
        ) : (
          <div className="markdown-body prose prose-zinc max-w-none prose-lg prose-p:text-zinc-600 prose-headings:text-zinc-900">
            <Markdown>{thumbnailIdeas}</Markdown>
          </div>
        )}
      </div>
    </section>
  );
};
