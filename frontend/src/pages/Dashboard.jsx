import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  History, 
  Play, 
  BarChart3, 
  TrendingUp, 
  Clock,
  ChevronRight,
  Sparkles,
  Calendar
} from 'lucide-react';
import { DashboardSkeleton } from '../components/Skeleton';
import { cachedGet } from '../utils/apiCache';

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await cachedGet(`${import.meta.env.VITE_API_URL}/api/interviews/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSessions(data);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [token]);

  const totalSessions = useMemo(() => sessions.length, [sessions]);
  const averageScore = useMemo(() => 
    totalSessions > 0 
      ? (sessions.reduce((sum, s) => sum + s.totalScore, 0) / totalSessions).toFixed(1) 
      : '0.0',
    [sessions, totalSessions]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1] 
      } 
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <motion.div 
      className="container" 
      style={{ padding: '2.5rem 1.5rem', maxWidth: '1200px' }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Area */}
      <motion.div 
        variants={itemVariants}
        className="mb-12"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={18} className="text-primary" />
          <span className="label">Dashboard Overview</span>
        </div>
        <h1 className="mb-2">
          Welcome back, <span className="text-gradient">{user?.displayName?.split(' ')[0]}</span>
        </h1>
        <p className="text-lg">
          Your performance is improving. Ready for another session?
        </p>
      </motion.div>

      {/* Stats Cards Row */}
      <div className="grid md:grid-cols-3 mb-12">
        <motion.div variants={itemVariants} className="glass-panel p-8 flex items-center gap-6 overflow-hidden group">
          <div className="orb orb-accent" style={{ top: '-25%', right: '-15%', width: '120px', height: '120px' }}></div>
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
            <BarChart3 size={32} />
          </div>
          <div>
            <p className="label mb-1">Total Sessions</p>
            <h3 className="text-4xl font-black">{totalSessions}</h3>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-8 flex items-center gap-6 overflow-hidden group">
          <div className="orb orb-primary" style={{ top: '-25%', right: '-15%', width: '120px', height: '120px' }}></div>
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="label mb-1">Average Score</p>
            <h3 className="text-4xl font-black">{averageScore}<span className="text-xl text-muted font-bold">/10</span></h3>
          </div>
        </motion.div>

        {/* Start Button Card */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -8, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/setup')}
          className="glass-panel p-8 flex items-center gap-6 cursor-pointer overflow-hidden group"
          style={{ 
            background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.15) 0%, rgba(var(--secondary-rgb), 0.15) 100%)',
            border: '2px solid rgba(var(--primary-rgb), 0.3)'
          }}
        >
          <div className="orb orb-primary" style={{ bottom: '-30%', right: '-20%', width: '160px', height: '160px', opacity: 0.25 }}></div>
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg group-hover:shadow-glow transition-all" style={{ zIndex: 1 }}>
            <Play size={28} style={{ marginLeft: '4px' }} fill="currentColor" />
          </div>
          <div style={{ zIndex: 1 }}>
            <h3 className="text-2xl font-black">Start New</h3>
            <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">Mock Interview</p>
          </div>
        </motion.div>
      </div>

      {/* Recent Sessions List */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Clock size={22} className="text-primary" />
            <h3 className="text-2xl font-black">Recent Activity</h3>
          </div>
          {sessions.length > 0 && (
            <button 
              className="btn btn-secondary shadow-sm" 
              onClick={() => navigate('/history')}
            >
              Full History <ChevronRight size={16} />
            </button>
          )}
        </div>
        
        {sessions.length === 0 ? (
          <motion.div 
            className="glass-panel py-20 px-8 text-center"
            style={{ borderStyle: 'dashed', borderRadius: '2.5rem' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <History size={48} className="text-text-subtle" />
            </div>
            <h3 className="text-2xl mb-2">No interviews yet</h3>
            <p className="text-muted max-w-md mx-auto mb-8">Elevate your skills and land your dream job with personalized mock interviews.</p>
            <button 
              onClick={() => navigate('/setup')} 
              className="btn btn-primary px-10 py-4 text-lg"
            >
              Take First Interview
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {sessions.slice(0, 4).map((session, index) => (
              <motion.div 
                key={session.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ x: 12, borderColor: 'var(--primary)', background: 'var(--glass-hover)' }}
                onClick={() => navigate(`/session/${session.id}/summary`)}
                className="glass-panel px-8 py-5 flex justify-between items-center cursor-pointer group"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transition-transform group-hover:scale-105`} style={{ 
                    backgroundColor: session.totalScore >= 7 ? '#10b981' : session.totalScore >= 4 ? '#f59e0b' : '#ef4444',
                    boxShadow: `0 8px 24px -6px ${session.totalScore >= 7 ? '#10b981' : session.totalScore >= 4 ? '#f59e0b' : '#ef4444'}80`
                  }}>
                    {Math.round(session.totalScore)}
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold mb-1">{session.role}</h4>
                    <div className="flex items-center gap-4 text-xs font-bold text-muted uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Calendar size={14} className="opacity-60" /> {new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-border" />
                      <span className="text-accent">{session.difficulty}</span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-10">
                  <div className="text-right">
                    <p className="label mb-1">Time Expended</p>
                    <div className="font-bold text-base">{session.duration || '15m'}</div>
                  </div>
                  <ChevronRight size={22} className="text-text-subtle transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};


export default Dashboard;
