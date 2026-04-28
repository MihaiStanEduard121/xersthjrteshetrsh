import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { v4 as uuidv4 } from 'uuid';
import { Presentation } from '@/hooks/usePresentation';

import { Button } from '@/components/ui/button-component';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Layout } from 'lucide-react';

export function Dashboard() {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchPres = async () => {
      try {
        const q = query(collection(db, 'presentations'), where('hostId', '==', user.uid));
        const res = await getDocs(q);
        setPresentations(res.docs.map(d => ({ id: d.id, ...d.data() } as Presentation)));
      } catch (e) {
        // Just catching silently for demo
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPres();
  }, [user]);

  const handleCreate = async () => {
    if (!user || !newTitle.trim()) return;
    try {
      const pId = uuidv4();
      await setDoc(doc(db, 'presentations', pId), {
        hostId: user.uid,
        title: newTitle.trim(),
        currentSlideIndex: 0,
        status: 'waiting',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      // create a default slide
      await setDoc(doc(db, `presentations/${pId}/slides`, uuidv4()), {
        presentationId: pId,
        order: 0,
        title: "Welcome Slide",
        content: "This is your first slide.",
        updatedAt: serverTimestamp()
      });
      
      navigate(`/p/${pId}/host`);
    } catch(e) {
      handleFirestoreError(e, OperationType.CREATE, 'presentations');
    }
  };

  if (loading) return <div className="p-10 min-h-screen bg-[#050507] text-slate-200 font-sans flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#050507] text-slate-200 font-sans">
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]">N</div>
            <h1 className="text-xl font-semibold tracking-tight text-white">NexusPresent</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">{user?.email}</span>
            <Button variant="outline" size="sm" className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white text-xs px-4" onClick={logOut}>Log Out</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-slate-800 border-dashed bg-slate-900/30 flex flex-col items-center justify-center p-6 text-center hover:bg-slate-900/50 transition-colors rounded-xl">
              <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-4 mx-auto border border-slate-700 shadow-inner">
                <Plus className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-200 mb-6">Create Presentation</h3>
              <div className="w-full">
                <Input 
                  placeholder="Presentation title..." 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)}
                  className="mb-4 bg-slate-800 border-slate-700 text-slate-200 focus:ring-purple-500"
                />
                <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/20" onClick={handleCreate} disabled={!newTitle.trim()}>Create</Button>
              </div>
          </div>

          {presentations.map(p => (
            <div key={p.id} className="flex flex-col bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white tracking-tight truncate">{p.title}</h3>
                  <Layout className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">
                  Status: <span className="text-slate-300 capitalize">{p.status}</span>
                </div>
              </div>
              <div className="flex gap-2 p-4 border-t border-slate-800 bg-slate-900/80 mt-auto">
                <Button variant="default" className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold" onClick={() => navigate(`/p/${p.id}/host`)}>
                  Host
                </Button>
                <Button variant="outline" className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white font-bold" onClick={() => navigate(`/p/${p.id}`)}>
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
