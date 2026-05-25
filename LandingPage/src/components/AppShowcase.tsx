import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Download, Layout, Smartphone, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const screenshots = [
  { id: 1, src: '/assets/images/screen_home.jpg', title: 'Curated Home', desc: 'Personalized nasheed recommendations' },
  { id: 2, src: '/assets/images/screen_library.jpg', title: 'Your Library', desc: 'Sync your favorites across all devices' },
  { id: 3, src: '/assets/images/screen-categories.jpg', title: 'Global Content', desc: 'Nasheeds in over 10+ languages' },
  { id: 4, src: '/assets/images/screen-signin.jpg', title: 'Seamless Sync', desc: 'One account for all your spiritual needs' },
  { id: 5, src: '/assets/images/screen-account.jpg', title: 'Profile Control', desc: 'Manage your listening preferences' },
];

export default function AppShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [50, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section id="experience" ref={containerRef} className="section-padding overflow-hidden bg-black relative">
      <div className="max-w-7xl mx-auto mb-32">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div style={{ opacity }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-emerald-400 text-sm font-semibold mb-6">
              <Layout className="w-4 h-4" />
              Unified Experience
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-8 leading-tight">
              A Platform Built for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Pure Listening.</span>
            </h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-lg">
              Switch seamlessly between devices. Your spiritual journey continues wherever you are, ad-free and focused.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: 'Web Experience', icon: Layout, desc: 'Optimized for desktop' },
                { title: 'Mobile Native', icon: Smartphone, desc: 'Performance first' },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl glass-dark border-white/5 hover:border-emerald-500/20 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h4 className="font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="relative pt-20 lg:pt-0">
            {/* Main Web Preview */}
            <motion.div
              style={{ opacity }}
              className="relative z-10 w-full aspect-video rounded-2xl md:rounded-3xl border-[4px] md:border-[8px] border-zinc-900 bg-zinc-950 overflow-hidden shadow-2xl shadow-emerald-500/5"
            >
               <div className="absolute top-0 left-0 w-full h-6 md:h-8 bg-zinc-900 flex items-center px-4 gap-1.5 md:gap-2">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500/50" />
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-500/50" />
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500/50" />
               </div>
               <div className="pt-10 md:pt-14 p-4 md:p-8 grid grid-cols-12 gap-4 md:gap-6 h-full">
                  <div className="col-span-3 space-y-3 md:space-y-4">
                    <div className="h-3 md:h-4 bg-zinc-900 rounded w-full" />
                    <div className="h-3 md:h-4 bg-zinc-900 rounded w-4/5" />
                    <div className="h-3 md:h-4 bg-zinc-900 rounded w-3/4" />
                  </div>
                  <div className="col-span-9 space-y-4 md:space-y-6">
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="aspect-square rounded-xl md:rounded-2xl bg-zinc-900" />
                      ))}
                    </div>
                    <div className="h-24 md:h-40 rounded-xl md:rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-white/5" />
                  </div>
               </div>
            </motion.div>

            {/* Floating Mobile Preview 1 */}
            <motion.div
              style={{ y: y1 }}
              className="absolute -bottom-12 -right-4 md:-right-12 z-20 w-32 md:w-56 aspect-[9/19] rounded-[24px] md:rounded-[40px] border-[3px] md:border-[6px] border-zinc-900 bg-black shadow-2xl overflow-hidden"
            >
              <img src="/assets/images/screen_home.jpg" alt="Mobile App" className="w-full h-full object-cover" />
            </motion.div>
            
            {/* Floating Mobile Preview 2 */}
            <motion.div
              style={{ y: y2 }}
              className="absolute -top-8 -left-4 md:-left-12 z-0 w-28 md:w-48 aspect-[9/19] rounded-[20px] md:rounded-[36px] border-[3px] md:border-[6px] border-zinc-900 bg-black shadow-2xl overflow-hidden opacity-40 grayscale group-hover:grayscale-0 transition-all"
            >
              <img src="/assets/images/screen_library.jpg" alt="Mobile App" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Horizontal Screenshots Slider */}
      <div className="relative mt-20">
        <div className="max-w-7xl mx-auto px-6 mb-12 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Explore the Interface</h3>
            <p className="text-zinc-500 text-sm">Designed for clarity and spiritual focus.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition-all active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition-all active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto px-6 md:px-[calc((100vw-80rem)/2+1.5rem)] pb-12 no-scrollbar snap-x snap-mandatory"
        >
          {screenshots.map((ss) => (
            <motion.div
              key={ss.id}
              whileHover={{ y: -10 }}
              className="relative flex-none w-64 md:w-72 snap-center group"
            >
              <div className="aspect-[9/19] rounded-[32px] border-[6px] border-zinc-900 overflow-hidden shadow-2xl mb-6 bg-zinc-900">
                <img src={ss.src} alt={ss.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="px-4">
                <h4 className="font-bold text-white text-lg mb-1">{ss.title}</h4>
                <p className="text-zinc-500 text-sm">{ss.desc}</p>
              </div>
            </motion.div>
          ))}
          {/* Spacer for end of scroll */}
          <div className="flex-none w-px h-full md:w-[calc((100vw-80rem)/2+1.5rem)]" />
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
