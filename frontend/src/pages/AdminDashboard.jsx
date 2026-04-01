import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, TrendingUp, Activity, BarChart2, ShieldCheck, Mail, Calendar, ExternalLink, Search, Filter } from 'lucide-react';
import { DashboardSkeleton } from '../components/Skeleton';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [globalStats, setGlobalStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        const [usersRes, statsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setUsers(usersRes.data);
        setGlobalStats(statsRes.data);
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, navigate, user]);

  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      totalSessions: globalStats.reduce((sum, day) => sum + day.sessions, 0),
      avgGlobalScore: globalStats.length > 0 
        ? (globalStats.reduce((sum, day) => sum + day.avgScore, 0) / globalStats.length).toFixed(1)
        : '0.0'
    };
  }, [users, globalStats]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <motion.div 
      className="container" 
      style={{ padding: '2.5rem 1.5rem', maxWidth: '1400px', paddingBottom: '6rem' }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Background Orbs */}
      <div className="orb orb-primary" style={{ top: '5%', right: '10%', width: '400px', height: '400px', opacity: 0.08 }}></div>
      <div className="orb orb-accent" style={{ bottom: '10%', left: '5%', width: '350px', height: '350px', opacity: 0.08 }}></div>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-14 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={18} className="text-primary" />
            <span className="label">Admin Control Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Platform <span className="text-gradient">Intelligence</span></h1>
          <p className="text-muted text-lg mt-1">Global performance metrics and ecosystem growth analysis.</p>
        </div>
        <div className="flex gap-4">
           <button className="btn btn-secondary py-3 px-6" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
           </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-12 relative z-10">
        {[
          { icon: <Users size={26} />, label: 'Active Talent', value: stats.totalUsers, color: 'var(--accent)' },
          { icon: <Activity size={26} />, label: 'Total Executions', value: stats.totalSessions, color: 'var(--primary)' },
          { icon: <TrendingUp size={26} />, label: 'Global Mean Score', value: `${stats.avgGlobalScore}/10`, color: '#10b981' },
          { icon: <BarChart2 size={26} />, label: 'Retention Rate', value: '92.4%', color: '#f59e0b' }
        ].map(({ icon, label, value, color }) => (
          <motion.div variants={itemVariants} key={label} className="glass-panel p-8 flex items-center gap-6 overflow-hidden group">
            <div className="orb" style={{ background: color, top: '-20%', right: '-15%', width: '100px', height: '100px', opacity: 0.1 }}></div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: `${color}15`, color }}>{icon}</div>
            <div>
              <p className="label mb-1 opacity-70">{label}</p>
              <h3 className="text-3xl font-black tracking-tight">{value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Grid */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12 relative z-10">
        <motion.div variants={itemVariants} className="glass-panel p-10 overflow-hidden">
          <div className="flex items-center justify-between mb-10">
             <div>
                <span className="label text-primary block mb-1">Scale Evolution</span>
                <h3 className="font-black text-2xl tracking-tight flex items-center gap-2">
                  <Activity size={22} className="text-primary" /> Session Velocity
                </h3>
             </div>
          </div>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <AreaChart data={globalStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sessionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} dy={15} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--glass)', backdropFilter: 'blur(16px)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '1.25rem', boxShadow: 'var(--shadow-strong)' }}
                  itemStyle={{ fontWeight: 900, color: 'var(--text-main)', fontSize: '1rem' }}
                  labelStyle={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.6rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
                <Area type="monotone" dataKey="sessions" stroke="var(--primary)" strokeWidth={5} fill="url(#sessionGrad)" animationDuration={1800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-10 overflow-hidden">
          <div className="flex items-center justify-between mb-10">
             <div>
                <span className="label text-accent block mb-1">Technical Baseline</span>
                <h3 className="font-black text-2xl tracking-tight flex items-center gap-2">
                   <TrendingUp size={22} className="text-accent" /> Score distribution
                </h3>
             </div>
          </div>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <LineChart data={globalStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} dy={15} />
                <YAxis domain={[0, 10]} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--glass)', backdropFilter: 'blur(16px)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '1.25rem', boxShadow: 'var(--shadow-strong)' }}
                />
                <Line type="monotone" dataKey="avgScore" stroke="var(--accent)" strokeWidth={5} dot={{ r: 6, fill: 'var(--accent)', stroke: 'var(--bg-color)', strokeWidth: 4 }} activeDot={{ r: 10, strokeWidth: 5, stroke: 'var(--bg-color)' }} animationDuration={2500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* User Directory */}
      <motion.div variants={itemVariants} className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
           <div>
              <h3 className="text-3xl font-black tracking-tight">User Directory</h3>
              <p className="text-muted text-sm mt-1">Manage global user base and track historical performance.</p>
           </div>
           <div className="flex gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:min-w-[360px]">
                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" />
                <input type="text" placeholder="Search by name, email or role..." className="form-input py-4 pl-14 shadow-sm" />
             </div>
             <button className="btn btn-secondary p-4 rounded-xl">
                <Filter size={22} className="opacity-70" />
             </button>
           </div>
        </div>

        <div className="glass-panel overflow-hidden" style={{ borderRadius: '2.5rem' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-10 py-6 label opacity-60">Talent Identity</th>
                  <th className="px-10 py-6 label opacity-60">Authorization</th>
                  <th className="px-10 py-6 label opacity-60">Engagement</th>
                  <th className="px-10 py-6 label opacity-60">Aptitude Index</th>
                  <th className="px-10 py-6 label opacity-60">Onboarding</th>
                  <th className="px-10 py-6 label opacity-60 text-right">Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/2 transition-all group">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-primary/10 border border-white/5 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                           {u.profilePic ? <img src={u.profilePic} alt="" className="w-full h-full object-cover" /> : <Users size={24} className="text-primary opacity-60" />}
                        </div>
                        <div className="min-w-0">
                           <div className="font-extrabold text-lg text-text-main pr-2 mb-0.5">{u.name || 'Incognito Terminal'}</div>
                           <div className="text-xs text-muted flex items-center gap-1.5 font-semibold opacity-70 tracking-wide"><Mail size={12} className="text-primary" /> {u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-[0.15em] border ${u.role === 'ADMIN' ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-white/5 border-white/10 text-muted'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex flex-col gap-1">
                          <span className="text-base font-black text-text-main">{u.totalSessions}</span>
                          <span className="text-[10px] text-muted font-bold tracking-widest uppercase">Total Sessions</span>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className={`text-2xl font-black tracking-tight ${u.avgScore >= 8 ? 'text-success' : u.avgScore >= 5 ? 'text-warning' : u.avgScore > 0 ? 'text-danger' : 'text-muted opacity-40'}`}>
                        {u.avgScore > 0 ? u.avgScore : 'PENDING'}
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="text-xs text-muted flex items-center gap-2 font-bold opacity-80">
                        <Calendar size={14} className="text-primary" /> {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <button className="p-3 rounded-2xl bg-white/5 border border-white/5 text-muted hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100">
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};


export default AdminDashboard;
