import React, { useState } from 'react';
import { Mic, Play, Pause, Download, Loader2, AlertCircle, RefreshCw, Music } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VoiceoverSectionProps {
  script: string;
  onGenerateVoiceover: (text: string) => Promise<string | undefined>;
}

export const VoiceoverSection: React.FC<VoiceoverSectionProps> = ({ script, onGenerateVoiceover }) => {
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (!script) return;
    setLoading(true);
    try {
      const base64 = await onGenerateVoiceover(script);
      if (base64) {
        const blob = await fetch(`data:audio/wav;base64,${base64}`).then(res => res.blob());
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }
    } catch (error) {
      console.error("Voiceover generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioUrl) return;
    
    if (isPlaying && audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      const audio = audioElement || new Audio(audioUrl);
      if (!audioElement) setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `voiceover-${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="voiceover-section" className="bg-white border border-zinc-100 rounded-[3rem] shadow-xl overflow-hidden">
      <div className="px-10 py-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
        <div className="flex items-center gap-5">
          <div className="bg-orange-500 p-3.5 rounded-2xl text-white shadow-lg shadow-orange-500/20">
            <Mic size={28} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-zinc-900 tracking-tight">استوديو التعليق الصوتي</h3>
            <p className="text-zinc-500 font-bold text-sm">تحويل النص إلى صوت بشري طبيعي</p>
          </div>
        </div>
      </div>
      
      <div className="p-12">
        {!audioUrl ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-8">
            <div className="relative">
              <div className="bg-zinc-50 w-40 h-40 rounded-full flex items-center justify-center animate-pulse">
                <Mic className="text-zinc-200" size={80} />
              </div>
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white p-3 rounded-2xl shadow-lg">
                <Music size={24} />
              </div>
            </div>
            
            <div className="space-y-4 max-w-xl">
              <h4 className="text-3xl font-black text-zinc-900">صوت احترافي بضغطة زر</h4>
              <p className="text-zinc-500 text-xl leading-relaxed">
                نستخدم أحدث تقنيات تحويل النص إلى كلام (TTS) لإنتاج صوت مشوق يناسب محتوى يوتيوب، مع مخارج حروف دقيقة وأداء بشري.
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-blue-50 text-blue-700 px-6 py-3 rounded-2xl text-sm font-black border border-blue-100">
              <AlertCircle size={20} />
              النسخة التجريبية تدعم أول 1000 حرف من السكريبت
            </div>

            <motion.button 
              onClick={handleGenerate}
              disabled={loading || !script}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative bg-zinc-900 hover:bg-zinc-800 text-white px-12 py-5 rounded-[2rem] font-black text-xl flex items-center gap-4 transition-all shadow-2xl disabled:opacity-50 overflow-hidden"
            >
              {loading ? <Loader2 className="animate-spin" size={28} /> : <Mic size={28} className="group-hover:scale-110 transition-transform" />}
              توليد التعليق الصوتي
            </motion.button>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-500 rounded-full blur-[100px]"></div>
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex items-center gap-8">
                <motion.button 
                  onClick={togglePlay}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-24 h-24 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/40 group/play"
                >
                  {isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2 group-hover:scale-110 transition-transform" />}
                </motion.button>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-orange-400">
                    Studio Quality
                  </div>
                  <h4 className="text-3xl font-black">التعليق الصوتي جاهز</h4>
                  <p className="text-zinc-400 font-bold text-lg">بصوت "Kore" - أداء مشوق ومحفز</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <motion.button 
                  onClick={handleDownload}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 bg-white text-zinc-900 px-8 py-4 rounded-2xl font-black text-lg hover:bg-zinc-100 transition-all shadow-xl"
                >
                  <Download size={24} />
                  تحميل الملف
                </motion.button>
                <motion.button 
                  onClick={() => setAudioUrl(null)}
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                  title="إعادة التوليد"
                >
                  <RefreshCw size={24} />
                </motion.button>
              </div>
            </div>
            
            {/* Visualizer */}
            <div className="mt-12 flex items-end justify-center gap-1.5 h-20">
              {[...Array(40)].map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-2 bg-orange-500 rounded-full transition-all duration-300",
                    isPlaying ? "opacity-100" : "opacity-20"
                  )}
                  style={{ 
                    height: isPlaying ? `${20 + Math.random() * 80}%` : '10%',
                    transitionDelay: `${i * 0.02}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
