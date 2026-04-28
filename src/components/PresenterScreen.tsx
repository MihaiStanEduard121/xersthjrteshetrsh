import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePresentation } from '@/hooks/usePresentation';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PresenterScreen() {
  const { id } = useParams<{ id: string }>();
  const { presentation, slides, loading, error } = usePresentation(id);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#050507] text-slate-200 font-sans">Loading presentation...</div>;
  if (!presentation || error) return <div className="flex h-screen items-center justify-center bg-[#050507] text-slate-200 font-sans">{error || 'Not found'}</div>;

  const currentSlide = slides[presentation.currentSlideIndex];

  if (presentation.status === 'waiting') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050507] text-slate-200 font-sans flex-col gap-6 relative">
         <h1 className="text-6xl font-black tracking-tight text-white">{presentation.title}</h1>
         <p className="text-slate-400 text-xl font-light">The presentation will begin shortly.</p>
         <div className="mt-12 text-center text-slate-500">
           <p className="text-[10px] font-bold uppercase tracking-widest mb-2">Join at</p>
           <p className="font-mono text-2xl text-purple-400">{window.location.origin}/p/{id}</p>
         </div>
         <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-slate-400 hover:bg-slate-800 hover:text-white" onClick={toggleFullscreen}>
           {isFullscreen ? <Minimize /> : <Maximize />}
        </Button>
      </div>
    );
  }

  // Active state
  return (
    <div className="relative flex h-screen bg-[#050507] text-slate-200 font-sans overflow-hidden">
      <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-50 text-slate-500 hover:bg-slate-800 hover:text-white" onClick={toggleFullscreen}>
        {isFullscreen ? <Minimize /> : <Maximize />}
      </Button>

      <div className="flex-1 relative flex items-center justify-center p-12 lg:p-24 bg-[#020204]">
        <AnimatePresence mode="wait">
          {currentSlide && (
             <motion.div
               key={currentSlide.id}
               initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
               animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
               exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
               transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
               className="flex flex-col items-center justify-center text-center max-w-6xl w-full"
             >
               <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-12 lg:mb-16 leading-none text-white">
                 {currentSlide.title}
               </h1>
               {currentSlide.imageUrl && (
                 <motion.img 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3, duration: 0.8 }}
                   src={currentSlide.imageUrl} 
                   className="max-h-[40vh] md:max-h-[50vh] object-contain mb-12 rounded-2xl shadow-[0_0_50px_rgba(124,58,237,0.15)]" 
                 />
               )}
               <p className="text-3xl md:text-4xl lg:text-5xl font-light leading-relaxed text-slate-300 max-w-5xl">
                 {currentSlide.content}
               </p>
             </motion.div>
          )}
        </AnimatePresence>
        
        <div className="absolute bottom-8 left-8 text-slate-500 font-mono text-sm tracking-widest font-bold">
           {presentation.currentSlideIndex + 1} <span className="opacity-50">/ {slides.length}</span>
        </div>
      </div>
    </div>
  );
}
