import React from 'react';
import { Video, RefreshCw, Loader2, Search } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion } from 'motion/react';

interface ResourcesSectionProps {
  resources: string;
  loadingResources: boolean;
  fetchResources: () => void;
}

export const ResourcesSection: React.FC<ResourcesSectionProps> = ({
  resources,
  loadingResources,
  fetchResources
}) => {
  return (
    <section id="resources-section" className="bg-white border border-zinc-100 rounded-[3rem] shadow-xl overflow-hidden h-full flex flex-col">
      <div className="px-10 py-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
        <div className="flex items-center gap-5">
          <div className="bg-emerald-500 p-3.5 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
            <Video size={28} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-zinc-900 tracking-tight">مصادر المونتاج</h3>
            <p className="text-zinc-500 font-bold text-sm">لقطات B-roll ومصادر مرئية</p>
          </div>
        </div>
        <motion.button 
          onClick={fetchResources}
          disabled={loadingResources}
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:border-emerald-200 transition-all disabled:opacity-30"
        >
          <RefreshCw size={20} className={loadingResources ? "animate-spin" : ""} />
        </motion.button>
      </div>
      
      <div className="p-12 flex-1">
        {loadingResources ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Search className="text-emerald-500" size={24} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-black text-zinc-900">جاري البحث...</p>
              <p className="text-zinc-400 font-bold">نبحث في أفضل قواعد بيانات الفيديوهات العالمية</p>
            </div>
          </div>
        ) : (
          <div className="markdown-body prose prose-zinc max-w-none prose-lg prose-p:text-zinc-600 prose-headings:text-zinc-900">
            <Markdown>{resources}</Markdown>
          </div>
        )}
      </div>
    </section>
  );
};
