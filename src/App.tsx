/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Video, 
  Image as ImageIcon, 
  Loader2, 
  Sparkles,
  Download,
  LayoutDashboard,
  Lightbulb,
  Mic,
  ArrowRight,
  Zap,
  Clock,
  FolderOpen,
  PenTool,
  PlayCircle,
  Plus,
  MoreVertical,
  TrendingUp
} from 'lucide-react';
import { generateIdeas, generateScript, getResources, generateThumbnailIdeas, textToSpeech, generateImage } from './services/geminiService';

// Components
import { Header } from './components/Header';
import { IdeaCard } from './components/IdeaCard';
import { ScriptSection } from './components/ScriptSection';
import { VoiceoverSection } from './components/VoiceoverSection';
import { ResourcesSection } from './components/ResourcesSection';
import { ThumbnailSection } from './components/ThumbnailSection';

type Step = 'ideas' | 'production';

interface Idea {
  title: string;
  description: string;
  imagePrompt: string;
  imageUrl?: string;
  category: string;
}

interface Project {
  id: string;
  title: string;
  lastEdited: string;
  progress: number;
}

interface Draft {
  id: string;
  title: string;
  date: string;
}

interface TrendingIdea {
  id: string;
  title: string;
  views: string;
}

export default function App() {
  const [view, setView] = useState<Step>('ideas');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  const [projects] = useState<Project[]>([
    { id: '1', title: 'مصنع تيسلا جيجا برلين', lastEdited: 'قبل ساعتين', progress: 75 },
    { id: '2', title: 'كيف تصنع رقائق أبل', lastEdited: 'أمس', progress: 30 },
  ]);

  const [drafts] = useState<Draft[]>([
    { id: '1', title: 'أسرار مصانع أمازون', date: '12 مارس 2026' },
    { id: '2', title: 'مستقبل صناعة السيارات', date: '10 مارس 2026' },
  ]);

  const [trendingIdeas] = useState<TrendingIdea[]>([
    { id: '1', title: 'كيف تصنع رقائق البطاطس', views: '1.2M مشاهدة' },
    { id: '2', title: 'أسرار مصانع الشوكولاتة', views: '850K مشاهدة' },
    { id: '3', title: 'خط إنتاج المشروبات الغازية', views: '2.1M مشاهدة' },
  ]);
  
  // Production Data
  const [script, setScript] = useState<string>('');
  const [isEditingScript, setIsEditingScript] = useState<boolean>(false);
  const [resources, setResources] = useState<string>('');
  const [thumbnailIdeas, setThumbnailIdeas] = useState<string>('');
  
  const [audioLoading, setAudioLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const [loading, setLoading] = useState<{
    ideas?: boolean;
    script?: boolean;
    resources?: boolean;
    thumbnail?: boolean;
  }>({});

  const fetchIdeas = useCallback(async () => {
    setLoading(prev => ({ ...prev, ideas: true }));
    try {
      const data = await generateIdeas();
      setIdeas(data);
      
      // Generate images for each idea in parallel
      data.forEach(async (idea: Idea, index: number) => {
        try {
          const imageUrl = await generateImage(idea.imagePrompt);
          if (imageUrl) {
            setIdeas(prev => {
              const newIdeas = [...prev];
              if (newIdeas[index]) {
                newIdeas[index] = { ...newIdeas[index], imageUrl };
              }
              return newIdeas;
            });
          }
        } catch (err) {
          console.error(`Failed to generate image for idea ${index}:`, err);
        }
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, ideas: false }));
    }
  }, []);

  const fetchScript = useCallback(async (topic: string) => {
    setLoading(prev => ({ ...prev, script: true }));
    try {
      const data = await generateScript(topic);
      setScript(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, script: false }));
    }
  }, []);

  const fetchResources = useCallback(async () => {
    if (!selectedIdea) return;
    setLoading(prev => ({ ...prev, resources: true }));
    try {
      const data = await getResources(selectedIdea.title);
      setResources(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, resources: false }));
    }
  }, [selectedIdea]);

  const fetchThumbnail = useCallback(async () => {
    if (!selectedIdea) return;
    setLoading(prev => ({ ...prev, thumbnail: true }));
    try {
      const data = await generateThumbnailIdeas(selectedIdea.title);
      setThumbnailIdeas(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, thumbnail: false }));
    }
  }, [selectedIdea]);

  const startProduction = useCallback(async (idea: Idea) => {
    setSelectedIdea(idea);
    setView('production');
    setScript('');
    setResources('');
    setThumbnailIdeas('');
    fetchScript(idea.title);
  }, [fetchScript]);

  const playAudio = useCallback(async (text: string) => {
    if (isPlaying && audioElement) {
      audioElement.pause();
      setIsPlaying(false);
      return;
    }

    setAudioLoading(true);
    try {
      const base64Audio = await textToSpeech(text);
      if (base64Audio) {
        const audioBlob = await fetch(`data:audio/wav;base64,${base64Audio}`).then(res => res.blob());
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        setAudioElement(audio);
        audio.play();
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
      }
    } catch (error) {
      console.error("Audio error:", error);
    } finally {
      setAudioLoading(false);
    }
  }, [isPlaying, audioElement]);

  // Parallel fetching for resources and thumbnails
  useEffect(() => {
    if (view === 'production' && selectedIdea) {
      if (!resources && !loading.resources) fetchResources();
      if (!thumbnailIdeas && !loading.thumbnail) fetchThumbnail();
    }
  }, [view, selectedIdea, resources, thumbnailIdeas, loading.resources, loading.thumbnail, fetchResources, fetchThumbnail]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9F8] font-sans text-right selection:bg-orange-100" dir="rtl">
      <Header 
        view={view} 
        setView={setView} 
        playAudio={playAudio} 
        audioLoading={audioLoading} 
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 pb-32">
        <AnimatePresence mode="wait">
          {view === 'ideas' ? (
            <motion.div 
              key="ideas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Projects & Drafts */}
                <div className="lg:col-span-1 space-y-8">
                  {/* Ongoing Projects */}
                  <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                        <FolderOpen size={20} className="text-orange-500" />
                        مشاريع مستمرة
                      </h3>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                        <MoreVertical size={20} />
                      </motion.button>
                    </div>
                    <div className="space-y-4">
                      {projects.map(project => (
                        <motion.div 
                          key={project.id} 
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="group p-4 rounded-2xl hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-all cursor-pointer shadow-sm hover:shadow-md"
                        >
                          <h4 className="font-bold text-zinc-900 mb-2 group-hover:text-orange-500 transition-colors">{project.title}</h4>
                          <div className="flex items-center justify-between text-sm text-zinc-500 mb-3">
                            <span className="flex items-center gap-1"><Clock size={14} /> {project.lastEdited}</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${project.progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="bg-orange-500 h-full rounded-full"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Script Drafts */}
                  <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                        <PenTool size={20} className="text-emerald-500" />
                        مسودات السكريبت
                      </h3>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="bg-zinc-100 hover:bg-zinc-200 p-2 rounded-xl text-zinc-600 transition-colors">
                        <Plus size={16} />
                      </motion.button>
                    </div>
                    <div className="space-y-3">
                      {drafts.map(draft => (
                        <motion.div 
                          key={draft.id} 
                          whileHover={{ scale: 1.02, x: -4 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                        >
                          <div>
                            <h4 className="font-bold text-zinc-900 text-sm group-hover:text-emerald-600 transition-colors">{draft.title}</h4>
                            <span className="text-xs text-zinc-400">{draft.date}</span>
                          </div>
                          <ArrowRight size={16} className="text-zinc-300 group-hover:text-emerald-500 transition-all" />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Trending Ideas */}
                  <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-500" />
                        الأفكار الأكثر شهرة
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {trendingIdeas.map((idea, idx) => (
                        <motion.div 
                          key={idea.id} 
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                        >
                          <div className="text-2xl font-black text-zinc-200 group-hover:text-blue-200 transition-colors">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-900 text-sm group-hover:text-blue-600 transition-colors">{idea.title}</h4>
                            <span className="text-xs text-zinc-500 font-medium">{idea.views}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Hero & Ideas */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="relative overflow-hidden bg-zinc-900 rounded-[3rem] p-10 text-white shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-500 rounded-full blur-[150px]"></div>
                      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-500 rounded-full blur-[150px]"></div>
                    </div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="space-y-4 max-w-lg">
                        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md border border-white/10 text-orange-400">
                          <Zap size={16} fill="currentColor" />
                          مرحباً بك مجدداً، صانع المحتوى!
                        </div>
                        <h2 className="text-4xl font-black leading-[1.2]">بنك الأفكار <span className="text-orange-500">الاستراتيجية</span></h2>
                        <p className="text-zinc-400 text-lg leading-relaxed">نحلل ملايين البيانات لنقدم لك أفكار حصرية تضمن لك تصدر نتائج البحث.</p>
                      </div>
                      
                      <motion.button 
                        onClick={fetchIdeas}
                        disabled={loading.ideas}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative bg-orange-500 hover:bg-orange-600 text-white px-8 py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-2xl shadow-orange-500/20 disabled:opacity-50 overflow-hidden shrink-0"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        {loading.ideas ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
                        توليد أفكار جديدة
                      </motion.button>
                    </div>
                  </div>

                  {ideas.length > 0 ? (
                    <div className="space-y-10">
                      {Object.entries(
                        ideas.reduce((acc, idea) => {
                          const cat = idea.category || 'أفكار عامة';
                          if (!acc[cat]) acc[cat] = [];
                          acc[cat].push(idea);
                          return acc;
                        }, {} as Record<string, Idea[]>)
                      ).map(([category, categoryIdeas], catIdx) => (
                        <div key={catIdx} className="space-y-6">
                          <h3 className="text-2xl font-black text-zinc-900 flex items-center gap-3">
                            <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
                            {category}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {categoryIdeas.map((idea, idx) => (
                              <motion.div
                                key={`${catIdx}-${idx}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <IdeaCard idea={idea} index={idx} onClick={startProduction} />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !loading.ideas && (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-zinc-200 shadow-inner">
                      <div className="bg-zinc-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                        <Lightbulb className="text-zinc-300" size={48} />
                      </div>
                      <h3 className="text-2xl font-black text-zinc-900 mb-3">ابدأ رحلة الإبداع</h3>
                      <p className="text-zinc-400 max-w-sm mx-auto text-lg leading-relaxed">اضغط على الزر أعلاه لنقوم بتحليل السوق واقتراح أفضل المواضيع لك</p>
                    </div>
                  )}
                  
                  {loading.ideas && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white border border-zinc-100 p-2 rounded-[2.5rem] shadow-sm animate-pulse">
                          <div className="aspect-video bg-zinc-100 rounded-[2rem] mb-6"></div>
                          <div className="p-6 pt-0 space-y-4">
                            <div className="h-8 bg-zinc-100 rounded-xl w-3/4"></div>
                            <div className="h-4 bg-zinc-100 rounded-lg w-full"></div>
                            <div className="h-4 bg-zinc-100 rounded-lg w-5/6"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="production"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12"
            >
              {/* Production Header */}
              <div className="bg-zinc-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                  <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500 rounded-full blur-[130px] group-hover:blur-[150px] transition-all duration-1000"></div>
                  <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500 rounded-full blur-[130px] group-hover:blur-[150px] transition-all duration-1000"></div>
                </div>
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                  <div className="space-y-6">
                    <button 
                      onClick={() => setView('ideas')}
                      className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-bold group/back"
                    >
                      <ArrowRight size={20} className="group-hover/back:translate-x-1 transition-transform" />
                      العودة للأفكار
                    </button>
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md border border-white/10">
                        <LayoutDashboard size={18} className="text-orange-400" />
                        مختبر الإنتاج المتكامل
                      </div>
                      <h2 className="text-5xl md:text-6xl font-black leading-tight max-w-4xl tracking-tight">{selectedIdea?.title}</h2>
                      <p className="text-zinc-400 text-xl max-w-3xl leading-relaxed">{selectedIdea?.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => window.print()}
                      className="bg-white text-zinc-900 hover:bg-zinc-100 px-8 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl"
                    >
                      <Download size={24} />
                      تصدير المشروع
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-12">
                <ScriptSection 
                  script={script}
                  setScript={setScript}
                  isEditingScript={isEditingScript}
                  setIsEditingScript={setIsEditingScript}
                  loadingScript={loading.script || false}
                  fetchScript={() => selectedIdea && fetchScript(selectedIdea.title)}
                  playAudio={playAudio}
                  audioLoading={audioLoading}
                  isPlaying={isPlaying}
                />

                <VoiceoverSection 
                  script={script}
                  onGenerateVoiceover={textToSpeech}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <ResourcesSection 
                    resources={resources}
                    loadingResources={loading.resources || false}
                    fetchResources={fetchResources}
                  />

                  <ThumbnailSection 
                    thumbnailIdeas={thumbnailIdeas}
                    loadingThumbnail={loading.thumbnail || false}
                    fetchThumbnail={fetchThumbnail}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Bar for Production Mode */}
      <AnimatePresence>
        {view === 'production' && (
          <motion.div 
            initial={{ y: 100, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: 100, x: '-50%', opacity: 0 }}
            className="fixed bottom-8 left-1/2 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 px-10 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-10 z-50"
          >
            <button 
              onClick={() => document.getElementById('script-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex flex-col items-center gap-2 text-zinc-400 hover:text-orange-400 transition-all group"
            >
              <FileText size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">السكريبت</span>
            </button>
            <div className="w-px h-10 bg-white/10"></div>
            <button 
              onClick={() => document.getElementById('voiceover-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex flex-col items-center gap-2 text-zinc-400 hover:text-orange-400 transition-all group"
            >
              <Mic size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">التعليق</span>
            </button>
            <div className="w-px h-10 bg-white/10"></div>
            <button 
              onClick={() => document.getElementById('resources-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex flex-col items-center gap-2 text-zinc-400 hover:text-orange-400 transition-all group"
            >
              <Video size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">المونتاج</span>
            </button>
            <div className="w-px h-10 bg-white/10"></div>
            <button 
              onClick={() => document.getElementById('thumbnail-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex flex-col items-center gap-2 text-zinc-400 hover:text-orange-400 transition-all group"
            >
              <ImageIcon size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">الصورة</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
