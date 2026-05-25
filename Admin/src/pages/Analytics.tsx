import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Activity,
  PlayCircle,
  ClipboardList,
  AlertTriangle,
  Star,
  RefreshCcw,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, getCountFromServer, orderBy, limit, where } from "firebase/firestore";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn(
    "bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-hidden relative group transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20",
    className
  )}>
    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all duration-500" />
    {children}
  </div>
);

const MetricCard = ({ title, value, change, isPositive, icon: Icon, loading }: any) => {
  if (loading) {
    return (
      <GlassCard>
        <div className="flex justify-between items-start mb-4">
          <Skeleton className="w-10 h-10 rounded-2xl" />
          <Skeleton className="w-16 h-4" />
        </div>
        <Skeleton className="w-24 h-4 mb-2" />
        <Skeleton className="w-32 h-8" />
      </GlassCard>
    );
  }

  return (
    <motion.div variants={item}>
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-2xl bg-white/5 text-primary border border-white/5 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6" />
          </div>
          {change && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {change}%
            </div>
          )}
        </div>
        <h3 className="text-white/60 text-sm font-medium tracking-wide">{title}</h3>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export function Analytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListeners: 0,
    streamsToday: 0,
    totalTracks: 0
  });
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [recentModeration, setRecentModeration] = useState<any[]>([]);
  const [flaggedTracks, setFlaggedTracks] = useState<any[]>([]);
  const [streamingVelocity, setStreamingVelocity] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersCount = await getCountFromServer(collection(db, "users"));
        const tracksCount = await getCountFromServer(collection(db, "tracks"));
        
        setStats(prev => ({
          ...prev,
          totalUsers: usersCount.data().count,
          totalTracks: tracksCount.data().count
        }));
      } catch (err) {
        console.error("Error fetching counts", err);
      }
    };

    // Real-time Top Artists
    const artistsQuery = query(collection(db, "artists"), orderBy("followerCount", "desc"), limit(5));
    const unsubscribeArtists = onSnapshot(artistsQuery, (snapshot) => {
      const artists = snapshot.docs.map(doc => ({
        name: doc.data().name,
        value: doc.data().followerCount || 0
      }));
      setTopArtists(artists);
    });

    // Real-time Moderation Queue
    const moderationQuery = query(collection(db, "tracks"), where("status", "==", "pending"), limit(3));
    const unsubscribeModeration = onSnapshot(moderationQuery, (snapshot) => {
      setRecentModeration(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Real-time Flagged Tracks
    const flaggedQuery = query(collection(db, "tracks"), where("status", "==", "flagged"), limit(3));
    const unsubscribeFlagged = onSnapshot(flaggedQuery, (snapshot) => {
      setFlaggedTracks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Mocking streaming velocity for now as we don't have a streams collection yet
    // but building the structure to be ready
    setStreamingVelocity([
      { time: '00:00', streams: Math.floor(Math.random() * 2000) },
      { time: '04:00', streams: Math.floor(Math.random() * 2000) },
      { time: '08:00', streams: Math.floor(Math.random() * 5000) },
      { time: '12:00', streams: Math.floor(Math.random() * 8000) },
      { time: '16:00', streams: Math.floor(Math.random() * 7000) },
      { time: '20:00', streams: Math.floor(Math.random() * 9000) },
      { time: '23:59', streams: Math.floor(Math.random() * 6000) },
    ]);

    fetchData();
    setLoading(false);

    return () => {
      unsubscribeArtists();
      unsubscribeModeration();
      unsubscribeFlagged();
    };
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
            Analytics Insights
          </h1>
          <p className="text-white/40 mt-2 font-medium">Real-time performance metrics for HalalTune.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 rounded-xl bg-primary text-black text-sm font-bold hover:opacity-90 transition-opacity cinematic-shadow">
            View Live Logs
          </button>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricCard 
          title="Total Users" 
          value={stats.totalUsers.toLocaleString()} 
          change="12.5" 
          isPositive={true} 
          icon={Users}
          loading={loading}
        />
        <MetricCard 
          title="Tracks Uploaded" 
          value={stats.totalTracks.toLocaleString()} 
          change="8.2" 
          isPositive={true} 
          icon={PlayCircle}
          loading={loading}
        />
        <MetricCard 
          title="Streams Today" 
          value={stats.streamsToday.toLocaleString()} 
          change="3.1" 
          isPositive={false} 
          icon={Activity}
          loading={loading}
        />
        <MetricCard 
          title="Retention Rate" 
          value="68.4%" 
          change="4.5" 
          isPositive={true} 
          icon={RefreshCcw}
          loading={loading}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <GlassCard className="h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold">Streaming Velocity</h3>
                <p className="text-white/40 text-sm">Hourly distribution of streams</p>
              </div>
              <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none">
                <option>Today</option>
                <option>Yesterday</option>
              </select>
            </div>
            {loading ? (
              <Skeleton className="w-full h-[300px]" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={streamingVelocity}>
                    <defs>
                      <linearGradient id="colorStreamsAnalytics" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#ffffff20" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="#ffffff20" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => `${val > 999 ? (val/1000).toFixed(1) + 'k' : val}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="streams" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorStreamsAnalytics)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </GlassCard>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="h-full">
            <h3 className="text-xl font-bold mb-2">Top Artists</h3>
            <p className="text-white/40 text-sm mb-8">By market share (followers)</p>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="w-full h-[200px] rounded-full mx-auto max-w-[200px]" />
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="w-full h-8" />)}
                </div>
              </div>
            ) : topArtists.length === 0 ? (
              <p className="text-white/20 text-center py-20 italic">No artist data available</p>
            ) : (
              <div className="space-y-6">
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topArtists}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {topArtists.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {topArtists.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold">{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h3 className="font-bold">Moderation Queue</h3>
              </div>
            </div>
            <div className="space-y-4">
              {recentModeration.length === 0 ? (
                <p className="text-white/20 text-xs italic py-4">Queue is empty</p>
              ) : recentModeration.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold overflow-hidden">
                      {item.artworkUrl ? <img src={item.artworkUrl} className="w-full h-full object-cover" /> : <PlayCircle className="w-4 h-4 text-primary" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold truncate max-w-[120px]">{item.title}</p>
                      <p className="text-[10px] text-white/40 uppercase font-black">{item.artist}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-bold">Flagged Tracks</h3>
              </div>
            </div>
            <div className="space-y-4">
              {flaggedTracks.length === 0 ? (
                <p className="text-white/20 text-xs italic py-4">No tracks flagged</p>
              ) : flaggedTracks.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-red-500/5 hover:border-red-500/20 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold truncate max-w-[120px]">{item.title}</p>
                      <p className="text-[10px] text-red-400/60 uppercase font-black">{item.artist}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Star className="w-5 h-5" />
                </div>
                <h3 className="font-bold">Premium Conversion</h3>
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="h-[120px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={streamingVelocity.slice(0, 5)}>
                  <Bar dataKey="streams" fill="#10b981" radius={[4, 4, 4, 4]}>
                    {streamingVelocity.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fillOpacity={0.4 + (index * 0.15)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-2xl font-black">2.4%</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Conversion Rate</p>
              </div>
              <div className="text-right">
                <p className="text-emerald-400 text-sm font-bold">+0.8%</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Since last month</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
