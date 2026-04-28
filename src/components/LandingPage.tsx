import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button-component';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, MoveRight } from 'lucide-react';

export function LandingPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050507] text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background gradients for SaaS feel */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="max-w-4xl text-center z-10 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800 text-[10px] uppercase tracking-widest font-bold mb-8 backdrop-blur"
        >
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span className="text-slate-300">The future of interactive presentations</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1] text-white"
        >
          Present seamlessly <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            engage instantly.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl font-light leading-relaxed"
        >
          Control your slides from your phone, interact with your audience in real-time, and run flawless presentations from the cloud.
        </motion.p>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.3 }}
           className="flex flex-col sm:flex-row gap-4"
        >
          {user ? (
            <Button size="lg" className="h-14 px-8 text-sm font-bold uppercase tracking-widest bg-purple-600 text-white hover:bg-purple-500 rounded-full shadow-lg shadow-purple-500/20 transition-all" onClick={() => navigate('/dashboard')}>
              Go to Dashboard <MoveRight className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <Button size="lg" className="h-14 px-8 text-sm font-bold uppercase tracking-widest bg-purple-600 text-white hover:bg-purple-500 rounded-full shadow-lg shadow-purple-500/20 transition-all" onClick={signIn}>
              Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </motion.div>
      </div>

    </div>
  );
}
