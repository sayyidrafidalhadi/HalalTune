import { motion } from 'framer-motion';
import { Play, Sparkles, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

const floatingCards = [
  { id: 1, title: 'Mercy to Mankind', artist: 'Nasheed', color: 'bg-emerald-500', delay: 0 },
  { id: 2, title: 'Quran Recitation', artist: 'Surah Ar-Rahman', color: 'bg-zinc-800', delay: 0.2 },
  { id: 3, title: 'Islamic Podcast', artist: 'Spirituality', color: 'bg-emerald-600', delay: 0.4 },
];

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10">
        <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-emerald-500/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 text-center lg:text-left"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-emerald-400 text-sm font-semibold mb-8"
          >
            <Sparkles className="w-4 h-4" />
            The Premium Halal Audio Experience
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold font-display leading-[1.1] mb-8 tracking-tight">
            Redefining Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
              Spiritual Listening
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-xl mb-10 leading-relaxed mx-auto lg:mx-0">
            Vocals-only nasheeds, Quran recitations, podcasts, and spiritually aligned listening experiences. Free forever, ad-free always.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button
              className="w-full sm:w-auto px-8 py-4 bg-white/10 text-zinc-400 rounded-full font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-white/5"
            >
              <Play className="w-5 h-5 fill-current opacity-20" />
              Coming Soon
            </button>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-8 py-4 border border-white/10 rounded-full font-bold hover:bg-white/5 transition-all active:scale-95"
            >
              Explore Features
            </button>
          </div>

          <div className="mt-12 flex items-center gap-6 justify-center lg:justify-start">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-black">
                  <div className="w-full h-full rounded-full bg-black/20" />
                </div>
              ))}
            </div>
            <p className="text-sm text-zinc-500 font-medium">
              Join <span className="text-white">5,000+</span> spiritual listeners
            </p>
          </div>
        </motion.div>

        {/* Visual Mockup */}
        <div className="relative flex items-center justify-center">
          {/* Main App Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            className="relative w-[280px] md:w-[320px] aspect-[9/19] rounded-[48px] border-[8px] border-zinc-900 bg-black shadow-2xl overflow-hidden shadow-emerald-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 to-transparent pointer-events-none" />
            <div className="p-6">
               {/* Mockup Content */}
               <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-8" />
               <div className="flex items-center justify-between mb-8">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800" />
                  <div className="w-10 h-10 rounded-lg bg-zinc-800" />
               </div>
               <div className="aspect-square rounded-3xl bg-zinc-900 mb-8 flex items-center justify-center shadow-lg">
                  <Music className="w-20 h-20 text-emerald-500 opacity-20" />
               </div>
               <div className="space-y-4">
                  <div className="h-6 bg-zinc-900 rounded-md w-3/4" />
                  <div className="h-4 bg-zinc-900/50 rounded-md w-1/2" />
               </div>
               <div className="mt-12 space-y-6">
                  <div className="h-1 bg-zinc-900 rounded-full w-full">
                    <div className="h-full bg-emerald-500 w-1/3" />
                  </div>
                  <div className="flex items-center justify-center gap-8">
                    <div className="w-8 h-8 rounded-full bg-zinc-800" />
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                      <Play className="w-5 h-5 text-black fill-current" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-zinc-800" />
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Floating Cards */}
          {floatingCards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + card.delay, duration: 0.8 }}
              className={cn(
                "absolute hidden md:flex flex-col p-4 rounded-2xl glass-dark w-48 shadow-2xl border-white/5",
                card.id === 1 ? "top-10 -left-20" : card.id === 2 ? "bottom-20 -right-20" : "top-1/2 -right-32"
              )}
            >
              <div className={cn("w-10 h-10 rounded-lg mb-3 flex items-center justify-center", card.color)}>
                <Music className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-bold text-white mb-1">{card.title}</p>
              <p className="text-xs text-zinc-500">{card.artist}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
