import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Building2, BarChart3, ChevronRight, Loader2, Sparkles, Target, Zap, Shield } from 'lucide-react';
import { invalidateCache } from '../utils/apiCache';

const SetupPage = () => {
  const [role, setRole] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!role || !companyType || !difficulty) {
      setError('Please fill in all fields to continue.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interviews/start`,
        { role, companyType, difficulty },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const session = response.data;
      invalidateCache('history');
      navigate(`/session/${session.id}`);
    } catch (err) {
      console.error('Error starting session:', err);
      setError(err.response?.data?.error || 'Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'Product Manager',
    'DevOps Engineer',
    'Mobile Developer',
    'Software Engineer',
    'UI/UX Designer',
    'QA Engineer'
  ];

  const companyTypes = ['Startup', 'MNC', 'Tier 1 Tech', 'Early Stage', 'FinTech'];
  const difficulties = [
    { value: 'EASY', label: 'Beginner', icon: <Shield size={16} />, color: '#10b981' },
    { value: 'MEDIUM', label: 'Standard', icon: <Zap size={16} />, color: 'var(--primary)' },
    { value: 'HARD', label: 'Advanced', icon: <Target size={16} />, color: '#ef4444' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
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

  return (
    <div className="container flex justify-center items-center py-12 px-6 min-h-[calc(100vh-120px)]">
      <motion.div 
        className="glass-panel relative overflow-hidden" 
        style={{ width: '100%', maxWidth: '700px', padding: 'clamp(2.5rem, 8vw, 4.5rem)', borderRadius: '3.5rem' }}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Decorative Background */}
        <div className="orb orb-primary" style={{ top: '-15%', right: '-10%', width: '300px', height: '300px', opacity: 0.1 }}></div>
        <div className="orb orb-accent" style={{ bottom: '-15%', left: '-10%', width: '250px', height: '250px', opacity: 0.1 }}></div>

        <motion.div variants={itemVariants} className="text-center mb-14 relative z-10">
          <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary mx-auto mb-8 shadow-glow">
            <Sparkles size={38} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
            Configure Your <span className="text-gradient">Session</span>
          </h1>
          <p className="text-muted text-lg font-medium opacity-80 max-w-md mx-auto">Fine-tune the AI evaluation parameters to match your career target.</p>
        </motion.div>

        <motion.form onSubmit={handleStartInterview} className="grid gap-10 relative z-10">
          {/* Role & Company Row */}
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div variants={itemVariants} className="flex flex-col gap-4">
              <label className="label text-primary flex items-center gap-2.5 px-1">
                <Briefcase size={16} /> Target Discipline
              </label>
              <div className="relative group">
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="form-input py-4 pl-6 pr-12 text-base font-bold appearance-none cursor-pointer focus:border-primary/50"
                  required
                >
                  <option value="" disabled>Select Role</option>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-muted pointer-events-none group-hover:text-primary transition-colors">
                   <ChevronRight size={20} className="rotate-90" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col gap-4">
              <label className="label text-primary flex items-center gap-2.5 px-1">
                <Building2 size={16} /> Environment Focus
              </label>
              <div className="relative group">
                <select 
                  value={companyType} 
                  onChange={(e) => setCompanyType(e.target.value)}
                  className="form-input py-4 pl-6 pr-12 text-base font-bold appearance-none cursor-pointer focus:border-primary/50"
                  required
                >
                  <option value="" disabled>Select Organization</option>
                  {companyTypes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-muted pointer-events-none group-hover:text-primary transition-colors">
                   <ChevronRight size={20} className="rotate-90" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Difficulty Level */}
          <motion.div variants={itemVariants} className="flex flex-col gap-5">
            <label className="label text-primary flex items-center gap-2.5 px-1">
              <BarChart3 size={16} /> Evaluation Rigor
            </label>
            <div className="grid grid-cols-3 gap-5">
              {difficulties.map((diff) => (
                <motion.button
                  key={diff.value}
                  type="button"
                  whileHover={{ y: -6, boxShadow: 'var(--shadow-glow)' }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setDifficulty(diff.value)}
                  className={`flex flex-col items-center gap-3 p-6 rounded-3xl transition-all border-2 relative overflow-hidden ${
                    difficulty === diff.value 
                      ? 'border-primary bg-primary/10 text-text-main ring-4 ring-primary/5' 
                      : 'border-white/5 bg-white/5 text-text-muted hover:bg-white/10'
                  }`}
                >
                  <div className={`p-3 rounded-xl transition-all ${
                    difficulty === diff.value ? 'bg-primary/20 text-primary scale-110' : 'bg-white/5'
                  }`}>
                    {diff.icon}
                  </div>
                  <span className="text-sm font-black tracking-tight">{diff.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-danger/10 border border-danger/20 rounded-2xl text-danger text-sm text-center font-black"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button 
            type="submit" 
            disabled={loading}
            variants={itemVariants}
            className="btn btn-primary py-5 text-xl font-black shadow-glow flex items-center justify-center gap-4 rounded-2xl mt-4"
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={26} />
            ) : (
              <>Initialize AI Matrix <ChevronRight size={24} /></>
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
};


export default SetupPage;
