import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Rocket, Shield, Zap, Target, Star, ArrowRight, Brain, Sparkles, TrendingUp } from 'lucide-react';

const Landing = () => {
  const { isAuthenticated, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleSuccess = async (response) => {
    const res = await loginWithGoogle(response.credential);
    if (!res.success) alert(res.error);
  };

  // Stagger children
  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } }
  };

  const item = {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  const features = [
    { icon: <Zap size={18} />, text: 'Real-time AI Feedback', color: 'var(--accent)' },
    { icon: <Target size={18} />, text: 'Role-Specific Scoring', color: 'var(--primary)' },
    { icon: <Shield size={18} />, text: 'Privacy First', color: '#10b981' },
    { icon: <Star size={18} />, text: 'Personalized Insights', color: '#f59e0b' },
  ];

  const stats = [
    { value: '50k+', label: 'Mock Interviews' },
    { value: '4.9★', label: 'Avg Rating' },
    { value: '92%', label: 'Placement Rate' },
  ];

  const roles = [
    'Software Engineer', 'Product Manager', 'Data Scientist',
    'Frontend Dev', 'DevOps Engineer', 'Fullstack Dev', 'ML Engineer'
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0 6rem' }}>

      {/* Ambient Background Orbs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '5%', left: '10%', width: '600px', height: '600px', background: 'var(--primary)', filter: 'blur(160px)', opacity: 0.08, borderRadius: '50%' }}
        />
        <motion.div
          animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{ position: 'absolute', bottom: '5%', right: '5%', width: '500px', height: '500px', background: 'var(--secondary)', filter: 'blur(160px)', opacity: 0.08, borderRadius: '50%' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          style={{ position: 'absolute', top: '40%', right: '20%', width: '300px', height: '300px', background: 'var(--accent)', filter: 'blur(120px)', opacity: 0.06, borderRadius: '50%' }}
        />
      </div>

      {/* Hero Section */}
      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '900px' }}>
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          style={{ textAlign: 'center' }}
        >
          {/* Eyebrow badge */}
          <motion.div variants={item} style={{ marginBottom: '2rem' }}>
            <motion.span
              whileHover={{ scale: 1.05 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.45rem 1.1rem',
                background: 'rgba(var(--primary-rgb), 0.1)',
                border: '1px solid rgba(var(--primary-rgb), 0.22)',
                borderRadius: '2rem',
                fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                cursor: 'default',
                boxShadow: '0 0 20px rgba(var(--primary-rgb), 0.1)'
              }}
            >
              <Rocket size={14} />
              AI-Powered Career Growth
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }}
              />
            </motion.span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={item}
            style={{ fontSize: 'clamp(2.6rem, 6.5vw, 5rem)', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.04em', lineHeight: 1.08 }}
          >
            Master Your Next
            <br />
            <span className="text-gradient">Tech Interview</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={item}
            style={{ color: 'var(--text-muted)', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', maxWidth: '640px', margin: '0 auto 3rem', lineHeight: 1.7 }}
          >
            Practice with our AI coach that gives you instant feedback, realistic scoring, and actionable insights — so you walk into any interview with confidence.
          </motion.p>

          {/* Google Login CTA */}
          <motion.div
            variants={item}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '3.5rem' }}
          >
            <div style={{
              background: 'var(--glass)', backdropFilter: 'blur(20px)',
              border: '1px solid var(--border)', borderRadius: '1rem',
              padding: '0.5rem', boxShadow: 'var(--shadow)'
            }}>
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => alert('Google Login failed!')}
                useOneTap
                theme="filled_blue"
                shape="pill"
                size="large"
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={13} style={{ color: '#10b981' }} />
              No credit card required &bull; Start in 30 seconds
            </p>
          </motion.div>

          {/* Social Proof Stats */}
          <motion.div
            variants={item}
            style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', marginBottom: '4rem' }}
          >
            {stats.map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.04em' }}
                  className="text-gradient">{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '0.75rem', padding: '1.5rem 1rem',
                background: 'var(--glass)', backdropFilter: 'blur(20px)',
                border: '1px solid var(--border)', borderRadius: '1.25rem',
                cursor: 'default', textAlign: 'center',
                transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '0.875rem',
                background: `${f.color}15`, color: f.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 20px ${f.color}20`
              }}>
                {f.icon}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.3 }}>{f.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Role pills ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        style={{ width: '100%', marginTop: '5rem', position: 'relative', zIndex: 1, padding: '0 1rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-subtle)' }}>Works for every role</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {roles.map((role) => (
            <motion.span
              key={role}
              whileHover={{ scale: 1.06, borderColor: 'rgba(var(--primary-rgb), 0.5)', color: 'var(--primary)' }}
              style={{
                padding: '0.5rem 1.25rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '2rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                cursor: 'default',
                transition: 'all 0.25s ease'
              }}
            >
              {role}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Bottom CTA Strip */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginTop: '5rem', width: '100%', maxWidth: '800px', position: 'relative', zIndex: 1, padding: '0 1rem' }}
      >
        <div style={{
          background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.12) 0%, rgba(var(--secondary-rgb), 0.12) 100%)',
          border: '1px solid rgba(var(--primary-rgb), 0.2)',
          borderRadius: '2rem', padding: 'clamp(2rem, 6vw, 3rem)',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ position: 'absolute', top: '-40%', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '150px', background: 'var(--primary)', filter: 'blur(80px)', opacity: 0.12, borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <Brain size={20} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Powered by GPT-4</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
            Ready to land your <span className="text-gradient">dream role?</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
            Join thousands of engineers who leveled up their interview skills.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              background: 'var(--glass)', backdropFilter: 'blur(16px)',
              border: '1px solid var(--border)', borderRadius: '0.875rem',
              padding: '0.4rem'
            }}>
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => alert('Google Login failed!')}
                theme="filled_blue"
                shape="pill"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;
