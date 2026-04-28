import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { usePresentation } from '@/hooks/usePresentation';
import { Button } from '@/components/ui/button-component';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Play, 
  Square, 
  ChevronLeft, 
  ChevronRight, 
  Settings,
  Share2,
  Tv,
  MessageSquare
} from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function PresentationHost() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { presentation, slides, messages, loading, error, updatePresentation } = usePresentation(id);
  const [jumpIdx, setJumpIdx] = useState('');

  if (loading) return <div>Loading presentation...</div>;
  if (!presentation || error) return <div>{error || 'Not found'}</div>;
  if (presentation.hostId !== user?.uid) return <div>Unauthorized. You are not the host.</div>;

  const handleNext = () => {
    if (presentation.currentSlideIndex < slides.length - 1) {
      updatePresentation({ currentSlideIndex: presentation.currentSlideIndex + 1 });
    }
  };

  const handlePrev = () => {
    if (presentation.currentSlideIndex > 0) {
      updatePresentation({ currentSlideIndex: presentation.currentSlideIndex - 1 });
    }
  };

  const currentSlide = slides[presentation.currentSlideIndex];
  const publicLink = `${window.location.origin}/p/${id}`;

  return (
    <div className="fixed inset-0 bg-[#050507] text-slate-200 font-sans flex flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-3/4 flex flex-col p-4 md:p-8 gap-4 h-full bg-[#020204]">
        
        <div className="flex justify-between items-center bg-slate-900/50 border border-slate-800 p-4 rounded-xl shadow-sm backdrop-blur-md shrink-0">
          <div>
            <h1 className="font-bold text-white tracking-tight">{presentation.title}</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Status: {presentation.status}</p>
          </div>
          <div className="flex gap-2">
           {presentation.status === 'waiting' && <Button className="bg-purple-600 hover:bg-purple-500 text-white border-0" onClick={() => updatePresentation({ status: 'active' })}><Play className="w-4 h-4 mr-2" /> Start</Button>}
           {presentation.status === 'active' && <Button variant="destructive" className="bg-red-600/20 text-red-500 hover:bg-red-600/30 border-0" onClick={() => updatePresentation({ status: 'ended' })}><Square className="w-4 h-4 mr-2" /> End</Button>}
           
           <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white"><Share2 className="w-4 h-4 mr-2"/> Share</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-200">
              <DialogTitle className="text-slate-200">Share Presentation</DialogTitle>
              <div className="flex flex-col items-center gap-6 py-6">
                 <div className="bg-white p-2 rounded"><QRCodeSVG value={publicLink} size={200} /></div>
                 <Input value={publicLink} readOnly className="text-center bg-slate-800 border-slate-700 text-slate-300 focus:ring-purple-500" />
                 <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white" onClick={() => {
                   window.open(`/p/${id}/presenter`, '_blank');
                 }}><Tv className="w-4 h-4 mr-2" /> Open Presenter Screen</Button>
              </div>
            </DialogContent>
           </Dialog>
           <Button variant="outline" className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white" onClick={() => navigate('/dashboard')}>Exit</Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center relative overflow-hidden">
          <div className="w-full max-w-4xl aspect-video bg-white rounded-xl shadow-2xl shadow-purple-900/20 flex flex-col items-center justify-center relative overflow-hidden group p-8">
            {currentSlide ? (
              <div className="w-full text-slate-900 text-center px-10 flex flex-col items-center">
                <h2 className="text-4xl font-black mb-6 tracking-tight">{currentSlide.title}</h2>
                {currentSlide.imageUrl && <img src={currentSlide.imageUrl} className="max-h-64 object-contain mb-6 rounded-lg" />}
                <p className="text-2xl text-slate-600">{currentSlide.content}</p>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">No slides added yet.</div>
            )}
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-4 rounded-xl flex items-center justify-between shrink-0">
          <div className="flex gap-2 items-center">
             <Button variant="outline" size="icon" className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-white" onClick={handlePrev} disabled={presentation.currentSlideIndex === 0}>
               <ChevronLeft className="w-5 h-5" />
             </Button>
             <span className="font-mono text-sm px-4 text-slate-300">
               {slides.length > 0 ? presentation.currentSlideIndex + 1 : 0} / {slides.length}
             </span>
             <Button variant="outline" size="icon" className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-white" onClick={handleNext} disabled={!slides.length || presentation.currentSlideIndex === slides.length - 1}>
               <ChevronRight className="w-5 h-5" />
             </Button>
          </div>
          
          <div className="flex gap-2 items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jump to slide</span>
            <Input 
              className="w-16 text-center bg-slate-800 border-slate-700 text-purple-400 font-bold focus:ring-purple-500 focus:border-purple-500" 
              placeholder="#" 
              value={jumpIdx} 
              onChange={e => setJumpIdx(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const idx = parseInt(jumpIdx) - 1;
                  if (!isNaN(idx) && idx >= 0 && idx < slides.length) {
                    updatePresentation({ currentSlideIndex: idx });
                    setJumpIdx('');
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/4 bg-slate-900/30 border-l border-slate-800 p-4 flex flex-col h-full shrink-0">
         <Tabs defaultValue="notes" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900 border border-slate-800">
            <TabsTrigger value="notes" className="text-[10px] uppercase tracking-widest font-bold data-[state=active]:bg-slate-800 data-[state=active]:text-purple-400">Notes</TabsTrigger>
            <TabsTrigger value="chat" className="text-[10px] uppercase tracking-widest font-bold data-[state=active]:bg-slate-800 data-[state=active]:text-purple-400">Chat</TabsTrigger>
            <TabsTrigger value="slides" className="text-[10px] uppercase tracking-widest font-bold data-[state=active]:bg-slate-800 data-[state=active]:text-purple-400">Slides</TabsTrigger>
          </TabsList>
          <TabsContent value="notes" className="flex-1 overflow-auto mt-4 bg-slate-900/50 rounded-xl border border-slate-800 p-4">
             {currentSlide?.speakerNotes ? (
                <div className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {currentSlide.speakerNotes}
                </div>
             ) : (
                <div className="text-slate-500 text-center mt-10 text-xs uppercase tracking-widest font-bold">No notes for this slide</div>
             )}
          </TabsContent>
          <TabsContent value="chat" className="flex-1 flex flex-col mt-4 overflow-hidden bg-slate-900/50 rounded-xl border border-slate-800 h-full">
             <div className="flex-1 overflow-y-auto space-y-3 p-4">
                {messages.length === 0 && <p className="text-slate-500 text-center mt-4 text-xs font-bold uppercase tracking-widest">No messages yet.</p>}
                {messages.map(m => (
                  <div key={m.id} className="text-sm border-b border-slate-800/50 pb-2 mb-2">
                    <span className="font-bold text-purple-400 text-[10px] uppercase tracking-wider">{m.userName}:</span> <span className="text-slate-300 text-xs ml-2">{m.text}</span>
                  </div>
                ))}
             </div>
          </TabsContent>
          <TabsContent value="slides" className="flex-1 flex flex-col mt-4 overflow-hidden gap-4">
             <div className="flex-1 overflow-y-auto space-y-3 pb-4">
               {slides.map((s, idx) => (
                 <div key={s.id} onClick={() => updatePresentation({ currentSlideIndex: idx })} className={`p-3 rounded border cursor-pointer transition-all ${presentation.currentSlideIndex === idx ? 'border-purple-500 bg-slate-800 shadow-[0_0_10px_rgba(124,58,237,0.2)]' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 opacity-60 hover:opacity-100'}`}>
                   <p className="font-bold text-[10px] uppercase tracking-widest text-slate-500 mb-1">Slide {idx + 1}</p>
                   <p className="text-xs text-slate-200 truncate font-semibold">{s.title}</p>
                 </div>
               ))}
             </div>
             <div className="border-t border-slate-800 pt-4">
                <Button className="w-full mb-2 bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700" variant="outline" onClick={() => {
                  // Fake PPTX upload delay
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = '.pptx';
                  fileInput.onchange = () => {
                     alert('Mock PPTX Uploading... In a real environment, this goes to a backend parsing service.');
                  };
                  fileInput.click();
                }}>Upload .PPTX</Button>
                <Dialog>
                 <DialogTrigger asChild>
                   <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/20">Add Slide</Button>
                 </DialogTrigger>
                 <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-200">
                   <DialogTitle className="text-slate-200">Add New Slide</DialogTitle>
                   <form onSubmit={async (e) => {
                     e.preventDefault();
                     const formData = new FormData(e.currentTarget);
                     try {
                       const { doc, setDoc, serverTimestamp, collection } = await import('firebase/firestore');
                       const { db } = await import('@/lib/firebase');
                       const { v4 } = await import('uuid');
                       const newRef = doc(collection(db, `presentations/${id}/slides`), v4());
                       await setDoc(newRef, {
                         presentationId: id,
                         order: slides.length,
                         title: formData.get('title'),
                         content: formData.get('content'),
                         speakerNotes: formData.get('speakerNotes'),
                         updatedAt: serverTimestamp()
                       });
                       // Close dialog logic here (omitted for brevity, handled by shadcn dialog internally if using controlled state, or just user closing)
                     } catch(err) { console.error(err); }
                   }} className="flex flex-col gap-4 py-4">
                      <Input name="title" placeholder="Slide Title" required className="bg-slate-800 border-slate-700 focus:ring-purple-500 text-slate-200" />
                      <Input name="content" placeholder="Slide Content" required className="bg-slate-800 border-slate-700 focus:ring-purple-500 text-slate-200" />
                      <Input name="speakerNotes" placeholder="Speaker Notes" className="bg-slate-800 border-slate-700 focus:ring-purple-500 text-slate-200" />
                      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-500">Save Slide</Button>
                   </form>
                 </DialogContent>
                </Dialog>
             </div>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
}
