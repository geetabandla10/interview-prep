import React, { useEffect, useState, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
  History, ArrowLeft, ExternalLink, Calendar, Layers, TrendingUp,
  ChevronRight, BarChart2,
  Trophy, Target, Sparkles
} from 'lucide-react';
import { HistorySkeleton } from '../components/Skeleton';
import { cachedGet } from '../utils/apiCache';

// ─── Custom Tooltip for chart ───────────────────────────────────────────────
const CustomTooltip = memo(({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel" style={{
        padding: '0.75rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-strong)'
      }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{label}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
          <p style={{ margin: 0, color: 'var(--text-main)', fontWeight: 600, fontSize: '0.85rem' }}>
            Score: {payload[0].value.toFixed(1)}
          </p>
        </div>
      </div>
    );
  }
  return null;
});

// ─── Score Badge ─────────────────────────────────────────────────────────────
const ScoreBadge = memo(({ score }) => {
  const color = score >= 8 ? '#10b981' : score >= 5 ? '#f59e0b' : '#ef4444';
  const label = score >= 8 ? 'Exceptional' : score >= 5 ? 'Good' : 'Keep Practicing';
  
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '1.75rem', fontWeight: 900, color, lineHeight: 1.1 }}>{score.toFixed(1)}</div>
      <div style={{ fontSize: '0.7rem', color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '0.2rem' }}>{label}</div>
    </div>
  );
});

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const SessionDetailModal = ({ session, onClose }) => {
  const navigate = useNavigate();
  if (!session) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }} onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-panel" 
        style={{
          maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
          padding: 'clamp(1.5rem, 5vw, 3rem)', borderRadius: '2rem', border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-strong)', position: 'relative'
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'rgba(var(--primary-rgb), 0.1)', padding: '0.25rem 0.75rem', borderRadius: '1rem', textTransform: 'uppercase' }}>{session.difficulty}</span>
              <span className="text-muted text-xs">•</span>
              <span className="text-muted text-xs font-semibold">{new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{session.role}</h2>
          </div>
          <ScoreBadge score={session.totalScore} />
        </div>

        {/* AI Session Summary */}
        {(session.summaryGood || session.summaryMissing) && (
          <div className="grid mb-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {session.summaryGood && (
              <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.1)' }}>
                <h5 style={{ color: '#10b981', margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trophy size={18} /> What Went Well
                </h5>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{session.summaryGood}</p>
              </div>
            )}
            {session.summaryMissing && (
              <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.1)' }}>
                <h5 style={{ color: '#f59e0b', margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target size={18} /> Improvements
                </h5>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{session.summaryMissing}</p>
              </div>
            )}
          </div>
        )}

        {/* Q&A List */}
        <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-4">Interview Insight</h4>
        <div className="grid" style={{ gap: '1rem' }}>
          {session.questions?.map((q, i) => (
            <div key={q.id} className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)' }}>
              <div className="flex justify-between gap-4 mb-3">
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>Q{i + 1}. {q.questionText}</p>
                {q.answer && (
                  <span style={{
                    fontWeight: 800, fontSize: '1.1rem',
                    color: q.answer.score >= 8 ? '#10b981' : q.answer.score >= 5 ? '#f59e0b' : '#ef4444'
                  }}>{q.answer.score}</span>
                )}
              </div>
              {q.answer && (
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic', borderLeft: '3px solid var(--border)', paddingLeft: '1rem' }}>
                  "{q.answer.userAnswer?.substring(0, 300)}{q.answer.userAnswer?.length > 300 ? '...' : ''}"
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-10">
          <button className="btn btn-primary flex-1 py-4"
            onClick={() => navigate(`/session/${session.id}/summary`)}>
            Full Session Summary <ExternalLink size={18} />
          </button>
          <button className="btn btn-secondary flex-1" onClick={onClose}>
            Back to History
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main History Page ────────────────────────────────────────────────────────
const HistoryPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  const openDetail = async (session) => {
    setDetailLoading(true);
    try {
      const data = await cachedGet(`${import.meta.env.VITE_API_URL}/api/interviews/${session.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedSession(data);
    } catch (err) {
      console.error('Failed to load detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const chartData = useMemo(() => 
    [...sessions]
      .reverse()
      .slice(-10)
      .map((s) => ({
        name: new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: parseFloat(s.totalScore.toFixed(1)),
        role: s.role
      })),
    [sessions]
  );

  const stats = useMemo(() => {
    if (sessions.length === 0) return null;
    return {
      avg: (sessions.reduce((sum, s) => sum + s.totalScore, 0) / sessions.length).toFixed(1),
      best: Math.max(...sessions.map(s => s.totalScore)).toFixed(1),
      roles: new Set(sessions.map(s => s.role)).size
    };
  }, [sessions]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  if (loading) return <HistorySkeleton />;

  return (
    <motion.div 
      className="container" 
      style={{ padding: '2.5rem 1.5rem', maxWidth: '1200px', paddingBottom: '5rem' }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-4 mb-10">
        <motion.button 
          whileHover={{ scale: 1.1, x: -4 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 glass-panel flex items-center justify-center hover:bg-white/5 transition-colors"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={24} />
        </motion.button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Growth Tracking</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Interview <span className="text-gradient">History</span></h1>
          <p className="text-muted">Analyze your evolution and refine your technique.</p>
        </div>
      </motion.div>

      {sessions.length === 0 ? (
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '6rem 2rem', textAlign: 'center', borderStyle: 'dashed', borderRadius: '2rem' }}>
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
            <History size={48} className="text-text-muted" />
          </div>
          <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>No data points yet</h3>
          <p className="text-muted" style={{ marginBottom: '2.5rem', maxWidth: '400px', margin: '0 auto 2.5rem' }}>Your journey starts here. Take a mock interview to populate your history.</p>
          <button className="btn btn-primary px-10" onClick={() => navigate('/setup')}>Start Your First Session</button>
        </motion.div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', marginBottom: '3rem' }}>
            {[
              { icon: <Layers size={28} />, label: 'Total Practice', value: sessions.length, color: 'var(--accent)' },
              { icon: <BarChart2 size={28} />, label: 'Mean Score', value: `${stats?.avg}/10`, color: 'var(--primary)' },
              { icon: <Trophy size={28} />, label: 'All-Time Best', value: `${stats?.best}/10`, color: '#10b981' },
              { icon: <Target size={28} />, label: 'Specialized Roles', value: stats?.roles, color: '#f59e0b' }
            ].map(({ icon, label, value, color }) => (
              <motion.div variants={itemVariants} key={label} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '80px', height: '80px', background: color, filter: 'blur(50px)', opacity: 0.1 }}></div>
                <div style={{ background: `${color}15`, color, padding: '0.875rem', borderRadius: '1.1rem' }}>{icon}</div>
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">{label}</p>
                  <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>{value}</h3>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '2rem' }}>
            {/* Progress Chart */}
            <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
              <div className="flex items-center justify-between mb-8">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <TrendingUp size={22} className="text-primary" /> Performance Delta
                </h3>
              </div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis domain={[0, 10]} ticks={[0, 5, 10]} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
                    <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={4} fill="url(#scoreGrad)" dot={{ fill: 'var(--primary)', stroke: 'var(--bg-color)', strokeWidth: 3, r: 5 }} activeDot={{ r: 8, strokeWidth: 4, stroke: 'var(--bg-color)' }} animationDuration={2000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Session List */}
            <div className="flex flex-col gap-4">
              <motion.h3 variants={itemVariants} style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Recent Log</motion.h3>
              <div className="flex flex-col gap-3">
                {sessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    variants={itemVariants}
                    className="glass-panel"
                    onClick={() => openDetail(session)}
                    style={{ padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', cursor: 'pointer' }}
                    whileHover={{ x: 8, borderColor: 'var(--primary)', background: 'var(--glass-hover)' }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <History size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold truncate" style={{ fontSize: '1.05rem' }}>{session.role}</h4>
                          <span className="text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-muted">{session.difficulty}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-text-muted font-medium">
                          <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span>{session._count?.questions || 0} questions</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div style={{ textAlign: 'right' }}>
                        <div className={`text-xl font-black ${session.totalScore >= 8 ? 'text-green-500' : session.totalScore >= 5 ? 'text-orange-500' : 'text-red-500'}`} style={{ color: session.totalScore >= 8 ? '#10b981' : session.totalScore >= 5 ? '#f59e0b' : '#ef4444' }}>
                          {session.totalScore.toFixed(1)}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-text-muted" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Loading overlay when fetching detail */}
      <AnimatePresence>
        {detailLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
          >
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="text-sm font-bold uppercase tracking-widest text-white">Analyzing Session...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedSession && (
        <SessionDetailModal session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}
    </motion.div>
  );
};

export default HistoryPage;

