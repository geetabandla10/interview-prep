import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { invalidateCache } from '../utils/apiCache';
import { Briefcase, BarChart3, ChevronRight, Loader2, Sparkles, Target, Zap, Shield, Building2 } from 'lucide-react';

const InterviewPrep = () => {
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [companyType, setCompanyType] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interviews/start`,
        { role, difficulty, companyType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      invalidateCache('history');
      navigate(`/session/${response.data.id}`);
    } catch (err) {
      console.error('Failed to start interview:', err);
      alert('Failed to start interview. Make sure your Backend is running and OpenAI key is set!');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Data Scientist', 'Product Manager', 'DevOps Engineer',
    'Mobile Developer', 'Software Engineer', 'UI/UX Designer', 'QA Engineer'
  ];

  const companyTypes = ['Startup', 'MNC', 'Tier 1 Tech', 'Early Stage', 'FinTech'];

  const difficulties = [
    { value: 'EASY', label: 'Beginner', icon: Shield, color: '#10b981', desc: 'Core fundamentals' },
    { value: 'MEDIUM', label: 'Standard', icon: Zap, color: 'var(--primary)', desc: 'Industry level' },
    { value: 'HARD', label: 'Advanced', icon: Target, color: '#ef4444', desc: 'Expert difficulty' },
  ];

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="container" style={{
      padding: '2rem 1.5rem', display: 'flex', justifyContent: 'center',
      alignItems: 'center', minHeight: 'calc(100vh - 100px)'
    }}>
      <motion.div
        variants={container} initial="hidden" animate="visible"
        style={{
          width: '100%', maxWidth: '620px',
          background: 'var(--glass)', backdropFilter: 'blur(20px)',
          border: '1px solid var(--border)', borderRadius: '2rem',
          padding: 'clamp(2rem, 7vw, 3.5rem)',
          boxShadow: 'var(--shadow-strong)',
          position: 'relative', overflow: 'hidden'
        }}
      >
        {/* Orbs */}
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(130px)', opacity: 0.1, borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: '250px', height: '250px', background: 'var(--secondary)', filter: 'blur(130px)', opacity: 0.1, borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Header */}
        <motion.div variants={item} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '1.25rem',
            background: 'rgba(var(--primary-rgb), 0.12)',
            border: '1px solid rgba(var(--primary-rgb), 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--primary)', margin: '0 auto 1.25rem',
            boxShadow: '0 0 30px rgba(var(--primary-rgb), 0.15)'
          }}>
            <Sparkles size={30} />
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 900, marginBottom: '0.6rem' }}>
            Setup Your <span className="text-gradient">Session</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Tailor the AI to match your preparation goals.
          </p>
        </motion.div>

        <form onSubmit={handleStart} style={{ display: 'grid', gap: '2rem' }}>
          {/* Role Select */}
          <motion.div variants={item}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--text-muted)',
              marginBottom: '0.625rem'
            }}>
              <Briefcase size={13} style={{ color: 'var(--primary)' }} /> Target Role
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-input"
                style={{ paddingRight: '2.5rem' }}
                required
              >
                <option value="" disabled>Select Role</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronRight size={16} style={{
                position: 'absolute', right: '1rem', top: '50%',
                transform: 'translateY(-50%) rotate(90deg)',
                color: 'var(--text-muted)', pointerEvents: 'none'
              }} />
            </div>
          </motion.div>

          {/* Company Type Select */}
          <motion.div variants={item}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--text-muted)',
              marginBottom: '0.625rem'
            }}>
              <Building2 size={13} style={{ color: 'var(--primary)' }} /> Company Focus
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
                className="form-input"
                style={{ paddingRight: '2.5rem' }}
                required
              >
                <option value="" disabled>Select Company Type</option>
                {companyTypes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronRight size={16} style={{
                position: 'absolute', right: '1rem', top: '50%',
                transform: 'translateY(-50%) rotate(90deg)',
                color: 'var(--text-muted)', pointerEvents: 'none'
              }} />
            </div>
          </motion.div>

          {/* Difficulty */}
          <motion.div variants={item}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--text-muted)',
              marginBottom: '0.75rem'
            }}>
              <BarChart3 size={13} style={{ color: 'var(--primary)' }} /> Rigor Intensity
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {difficulties.map((diff) => {
                const active = difficulty === diff.value;
                const Icon = diff.icon;
                return (
                  <motion.button
                    key={diff.value}
                    type="button"
                    whileHover={{ y: -4, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDifficulty(diff.value)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: '0.5rem', padding: '1rem 0.75rem',
                      borderRadius: '1rem', cursor: 'pointer',
                      border: `2px solid ${active ? diff.color : 'var(--border)'}`,
                      background: active ? `${diff.color}12` : 'rgba(255,255,255,0.03)',
                      transition: 'all 0.25s ease',
                      outline: 'none',
                      boxShadow: active ? `0 0 20px ${diff.color}25` : 'none'
                    }}
                  >
                    <div style={{
                      padding: '0.5rem', borderRadius: '0.625rem',
                      background: active ? `${diff.color}20` : 'rgba(255,255,255,0.04)',
                      color: active ? diff.color : 'var(--text-muted)',
                      transition: 'all 0.25s ease'
                    }}>
                      <Icon size={18} />
                    </div>
                    <span style={{
                      fontSize: '0.8rem', fontWeight: 700,
                      color: active ? 'var(--text-main)' : 'var(--text-muted)'
                    }}>{diff.label}</span>
                    <span style={{
                      fontSize: '0.68rem', color: active ? diff.color : 'var(--text-subtle)',
                      fontWeight: 600
                    }}>{diff.desc}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            variants={item}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary"
            style={{
              width: '100%', padding: '1rem 2rem',
              fontSize: '1.05rem', fontWeight: 800,
              borderRadius: '1rem', marginTop: '0.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem'
            }}
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={22} /> Generating Questions…</>
            ) : (
              <>Initiate AI Session <ChevronRight size={20} /></>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default InterviewPrep;
