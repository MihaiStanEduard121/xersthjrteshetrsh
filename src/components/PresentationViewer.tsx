import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePresentation } from '@/hooks/usePresentation';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function PresentationViewer() {
  const { id } = useParams<{ id: string }>();
  const { presentation, slides, messages, loading, error, addMessage } = usePresentation(id);
  const { user, signIn } = useAuth();
  const [chatInput, setChatInput] = useState('');

  if (loading) return <div className="flex h-screen items-center justify-center">Loading presentation...</div>;
  if (!presentation || error) return <div className="flex h-screen items-center justify-center">{error || 'Not found'}</div>;

  const handleSend = () => {
    if (chatInput.trim() && user) {
      addMessage(user.uid, user.email?.split('@')[0] || 'Guest', chatInput.trim());
      setChatInput('');
    }
  };

  const currentSlide = slides[presentation.currentSlideIndex];

  if (presentation.status === 'waiting') {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white flex-col gap-6">
         <h1 className="text-4xl font-light tracking-tight">{presentation.title}</h1>
         <p className="text-zinc-400">Waiting for the host to start...</p>
      </div>
    );
  }

  if (presentation.status === 'ended') {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white flex-col gap-6">
         <h1 className="text-4xl font-light tracking-tight">{presentation.title}</h1>
         <p className="text-zinc-400">This presentation has ended. Thank you!</p>
      </div>
    );
  }

  // Active state
  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#050507] text-slate-200 font-sans">
      
      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-8 bg-[#020204]">
        <div className="w-full max-w-4xl flex-1 max-h-[80vh] aspect-video bg-white rounded-xl shadow-[0_0_50px_rgba(124,58,237,0.15)] flex flex-col items-center justify-center relative overflow-hidden group p-8">
          <AnimatePresence mode="wait">
            {currentSlide ? (
               <motion.div
                 key={currentSlide.id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 1.05 }}
                 transition={{ duration: 0.4, ease: "easeInOut" }}
                 className="flex flex-col items-center justify-center text-center w-full"
               >
                 <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-slate-900">
                   {currentSlide.title}
                 </h1>
                 {currentSlide.imageUrl && (
                   <motion.img 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 0.2 }}
                     src={currentSlide.imageUrl} 
                     className="max-h-64 object-contain mb-6 rounded-lg" 
                   />
                 )}
                 <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl">
                   {currentSlide.content}
                 </p>
               </motion.div>
            ) : (
               <div className="text-slate-400">Loading slide...</div>
            )}
          </AnimatePresence>
        </div>
        <div className="absolute top-6 right-6 text-slate-500 font-mono text-[10px] font-bold uppercase tracking-widest bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
           {presentation.currentSlideIndex + 1} / {slides.length}
        </div>
      </div>

      <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col bg-slate-900/30 backdrop-blur-md h-1/3 md:h-full shrink-0">
         <div className="p-4 border-b border-slate-800 font-bold uppercase tracking-widest text-[10px] text-slate-500 flex items-center justify-between">
            <span>Live Chat</span>
            <div className="flex items-center gap-2 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[8px] text-green-500">Connected</span>
            </div>
         </div>
         <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse bg-slate-900/50">
            {[...messages].reverse().map(m => (
              <div key={m.id} className="text-sm">
                <span className="font-bold text-purple-400 text-[10px] uppercase tracking-wider">{m.userName}:</span>
                <span className="text-slate-300 text-xs ml-2 leading-relaxed">{m.text}</span>
              </div>
            ))}
         </div>
         <div className="p-4 border-t border-slate-800 bg-slate-900/80">
           {!user ? (
             <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold" onClick={signIn}>Sign in to chat</Button>
           ) : (
             <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2 relative">
                <Input 
                  className="bg-slate-800 border-none text-xs text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-purple-500 pr-10" 
                  placeholder="Send a message..." 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                />
                <Button type="submit" size="icon" className="absolute right-1 top-1 w-7 h-7 bg-purple-600 hover:bg-purple-500 rounded text-white shadow"><Send className="w-3 h-3"/></Button>
             </form>
           )}
         </div>
      </div>
    </div>
  );
}
