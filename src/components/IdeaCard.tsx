import React from 'react';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface Idea {
  title: string;
  description: string;
  imagePrompt?: string;
  imageUrl?: string;
  category: string;
}

interface IdeaCardProps {
  idea: Idea;
  index: number;
  onClick: (idea: Idea) => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, index, onClick }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white border border-zinc-100 rounded-[2.5rem] hover:border-orange-400 hover:shadow-[0_32px_64px_-12px_rgba(242,125,38,0.15)] transition-all duration-500 cursor-pointer group relative overflow-hidden flex flex-col h-full"
      onClick={() => onClick(idea)}
    >
      <div className="aspect-video w-full bg-zinc-50 relative overflow-hidden">
        {idea.imageUrl ? (
          <img 
            src={idea.imageUrl} 
            alt={idea.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
            <span className="text-zinc-400 text-xs font-bold animate-pulse">جاري تصميم الغلاف...</span>
          </div>
        )}
        
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 text-zinc-900 font-black text-sm z-10 shadow-sm">
          <Sparkles size={14} className="text-orange-500" />
          {String(index + 1).padStart(2, '0')}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
      
      <div className="p-8 space-y-4 flex-1 flex flex-col">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold self-start">
          {idea.category}
        </div>
        <h3 className="text-2xl font-black text-zinc-900 leading-tight group-hover:text-orange-600 transition-colors line-clamp-2">{idea.title}</h3>
        <p className="text-zinc-500 leading-relaxed text-lg line-clamp-2 flex-1">{idea.description}</p>
        
        <div className="pt-6 flex items-center justify-between border-t border-zinc-50">
          <div className="flex items-center gap-2 text-orange-600 font-black text-sm">
            بدء الإنتاج الذكي
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-all">
            <ChevronLeft size={20} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
