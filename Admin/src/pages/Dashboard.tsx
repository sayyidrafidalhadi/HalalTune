import React, { useState, useEffect } from "react";
import { 
  Users, 
  Music, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Clock
} from "lucide-react";
import { 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis
} from "recharts";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy, limit, getCountFromServer } from "firebase/firestore";

const StatCard = ({ title, value, change, isPositive, icon: Icon, loading }: any) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:bg-white/[0.07] hover:border-white/20 group relative overflow-hidden">
    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
      <Icon className="w-16 h-16" />
    </div>
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        <Icon className="w-5 h-5" />
      </div>
      {change && (
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      )}
    </div>
    <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
    {loading ? (
      <div className="h-8 w-24 bg-white/5 animate-pulse rounded mt-1" />
    ) : (
      <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
    )}
  </div>
);

export function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTracks: 0,
    pendingModeration: 0,
    totalArtists: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersCount = await getCountFromServer(collection(db, "users"));
        const tracksCount = await getCountFromServer(collection(db, "tracks"));
        const artistsCount = await getCountFromServer(collection(db, "artists"));
        
        setStats({
          totalUsers: usersCount.data().count,
          totalTracks: tracksCount.data().count,
          totalArtists: artistsCount.data().count,
          pendingModeration: 0 // Will be updated by real-time listener
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    const tracksQuery = query(collection(db, "tracks"), orderBy("createdAt", "desc"), limit(5));
    const unsubscribeTracks = onSnapshot(tracksQuery, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'track',
        title: doc.data().title,
        subtitle: `by ${doc.data().artist}`,
        time: doc.data().createdAt?.toDate() || new Date()
      }));
      setRecentActivity(activities);
      setLoading(false);
    });

    const pendingQuery = query(collection(db, "tracks")); // Filter for status pending in real app
    const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
      const pending = snapshot.docs.filter(d => d.data().status === 'pending').length;
      setStats(prev => ({ ...prev, pendingModeration: pending }));
    });

    fetchStats();
    return () => {
      unsubscribeTracks();
      unsubscribePending();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
          Command Center
        </h1>
        <p className="text-white/40 mt-2 font-medium text-sm lg:text-base">Platform overview and real-time operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          title="Total Listeners" 
          value={stats.totalUsers.toLocaleString()} 
          icon={Users} 
          loading={loading}
        />
        <StatCard 
          title="Tracks Library" 
          value={stats.totalTracks.toLocaleString()} 
          icon={Music} 
          loading={loading}
        />
        <StatCard 
          title="Verified Artists" 
          value={stats.totalArtists.toLocaleString()} 
          icon={Activity} 
          loading={loading}
        />
        <StatCard 
          title="Pending Review" 
          value={stats.pendingModeration} 
          change={stats.pendingModeration > 0 ? "Urgent" : null}
          isPositive={false}
          icon={TrendingUp} 
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[24px] lg:rounded-[32px] p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg lg:text-xl font-bold">Growth Velocity</h3>
            <div className="flex gap-2">
              <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase">Real-time</div>
            </div>
          </div>
          <div className="h-[250px] lg:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'Jan', val: 400 },
                { name: 'Feb', val: 300 },
                { name: 'Mar', val: 600 },
                { name: 'Apr', val: 800 },
                { name: 'May', val: 500 },
                { name: 'Jun', val: stats.totalTracks }
              ]}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[24px] lg:rounded-[32px] p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-8">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-lg lg:text-xl font-bold">Live Feed</h3>
          </div>
          <div className="space-y-6">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-white/5 rounded" />
                    <div className="h-3 w-1/2 bg-white/5 rounded" />
                  </div>
                </div>
              ))
            ) : recentActivity.length === 0 ? (
              <p className="text-white/20 text-center py-10 italic">Waiting for activity...</p>
            ) : recentActivity.map((act) => (
              <div key={act.id} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Music className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{act.title}</p>
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">{act.subtitle}</p>
                </div>
                <span className="text-[10px] text-white/20 font-bold whitespace-nowrap">
                  {Math.floor((new Date().getTime() - act.time.getTime()) / 60000)}m ago
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
