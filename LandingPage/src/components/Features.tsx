import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  Download, 
  Heart, 
  Mic2, 
  Cpu, 
  MonitorSmartphone 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    title: 'Halal-Only Audio',
    description: 'Every track is manually reviewed to ensure 100% Shariah compliance. No musical instruments, only pure vocals.',
    icon: ShieldCheck,
    color: 'emerald',
  },
  {
    title: 'Spotify-Level Player',
    description: 'Seamless playback, background audio, and beautiful lyrics integration for an immersive experience.',
    icon: Zap,
    color: 'blue',
  },
  {
    title: 'Quran Section',
    description: 'Listen to the worlds most beautiful recitations with translation and transliteration support.',
    icon: BookOpen,
    color: 'amber',
  },
  {
    title: 'Offline Listening',
    description: 'Download your favorite nasheeds and recitations to listen anytime, anywhere, without internet.',
    icon: Download,
    color: 'purple',
  },
  {
    title: 'Smart Recommendations',
    description: 'AI-driven suggestions based on your listening habits and spiritual goals.',
    icon: Heart,
    color: 'red',
  },
  {
    title: 'Podcasts & Lectures',
    description: 'Access a curated library of Islamic podcasts and lectures from world-renowned scholars.',
    icon: Mic2,
    color: 'orange',
  },
  {
    title: 'AI Halal Verification',
    description: 'Our proprietary AI scans audio patterns to ensure no hidden musical elements are present.',
    icon: Cpu,
    color: 'cyan',
  },
  {
    title: 'Cross-Platform',
    description: 'Switch seamlessly between Android, Web, and soon iOS and Desktop apps.',
    icon: MonitorSmartphone,
    color: 'indigo',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Features() {
  return (
    <section id="features" className="section-padding bg-zinc-950/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-display mb-6"
          >
            Built for the <span className="text-emerald-500">Pure Heart</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 max-w-2xl mx-auto text-lg"
          >
            Experience a streaming platform that respects your values and enhances your spiritual journey with cutting-edge technology.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative p-8 rounded-3xl glass-dark hover:bg-white/5 transition-all duration-500 overflow-hidden border-white/5 hover:border-emerald-500/20"
            >
              {/* Hover Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <feature.icon className="w-7 h-7 text-black transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors duration-500">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
