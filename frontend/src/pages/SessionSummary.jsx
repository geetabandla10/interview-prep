import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Award, LayoutDashboard, RefreshCcw, Target, Trophy, Sparkles, ChevronRight, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SummarySkeleton } from '../components/Skeleton';
import { cachedGet } from '../utils/apiCache';

const SessionSummary = () => {
    const { sessionId } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const data = await cachedGet(`${import.meta.env.VITE_API_URL}/api/interviews/${sessionId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSession(data);
                
                if (data.totalScore >= 8) {
                    const duration = 4 * 1000;
                    const animationEnd = Date.now() + duration;
                    const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 1000 };

                    const randomInRange = (min, max) => Math.random() * (max - min) + min;

                    const interval = setInterval(function() {
                        const timeLeft = animationEnd - Date.now();

                        if (timeLeft <= 0) {
                            return clearInterval(interval);
                        }

                        const particleCount = 60 * (timeLeft / duration);
                        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                    }, 250);
                }
            } catch (err) {
                console.error('Failed to fetch summary:', err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchSummary();
    }, [sessionId, token]);

    if (loading || !session) return <SummarySkeleton />;

    const { totalScore, questions, summaryGood, summaryMissing } = session;
    const answeredCount = questions.filter(q => q.answer).length;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
    };

    return (
        <motion.div 
            className="container max-w-5xl py-12 px-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="flex flex-col gap-10">
                {/* Hero Results Section */}
                <motion.div variants={itemVariants} className="glass-panel relative overflow-hidden" style={{ padding: 'clamp(2.5rem, 8vw, 5rem)', textAlign: 'center', borderRadius: '3.5rem' }}>
                    <div className="orb orb-primary" style={{ top: '-15%', right: '-10%', width: '300px', height: '300px', opacity: 0.15 }}></div>
                    <div className="orb orb-accent" style={{ bottom: '-15%', left: '-10%', width: '250px', height: '250px', opacity: 0.15 }}></div>

                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-primary font-black label mb-10 shadow-sm">
                        <Sparkles size={16} /> Evaluation Finalized
                    </div>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.4 }}
                        className="mb-10 flex justify-center"
                    >
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                            {totalScore >= 8 ? (
                                <Trophy size={110} className="text-primary drop-shadow-[0_0_30px_rgba(var(--primary-rgb),0.6)]" />
                            ) : totalScore >= 5 ? (
                                <Award size={110} className="text-secondary drop-shadow-[0_0_25px_rgba(var(--secondary-rgb),0.5)]" />
                            ) : (
                                <Activity size={110} className="text-muted opacity-40" />
                            )}
                        </div>
                    </motion.div>
                    
                    <h1 style={{ fontSize: 'clamp(2.75rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1 }} className="mb-4">
                        Performance <span className="text-gradient">Report</span>
                    </h1>
                    <p className="text-muted text-lg max-w-2xl mx-auto mb-14">
                        Comprehensive evaluation for <strong>{session.role}</strong> at <strong>{session.difficulty}</strong> tier.
                    </p>

                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
                        <div className="flex flex-col items-center">
                            <span className="label mb-5">Technical Score</span>
                            <div className="relative">
                                <div className={`text-[6.5rem] md:text-[9rem] font-black leading-none ${totalScore >= 8 ? 'text-success' : totalScore >= 5 ? 'text-warning' : 'text-danger'}`} style={{ color: totalScore >= 8 ? '#10b981' : totalScore >= 5 ? '#f59e0b' : '#ef4444' }}>
                                    {totalScore.toFixed(1)}
                                </div>
                                <span className="absolute -bottom-2 -right-12 text-3xl font-black text-muted opacity-25">/10</span>
                            </div>
                        </div>
                        
                        <div className="h-32 w-[1px] bg-white/10 hidden md:block"></div>

                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <span className="label mb-5">Competency Tier</span>
                            <div className="text-3xl md:text-5xl font-black text-text-main mb-3 tracking-tight">
                                {totalScore >= 8.5 ? 'Elite Expert' : totalScore >= 7 ? 'Strong Contender' : totalScore >= 5 ? 'Standard Dev' : 'Entry Level'}
                            </div>
                            <div className="flex items-center gap-2.5 px-4 py-1.5 bg-white/5 rounded-xl border border-white/10 text-xs font-black text-muted tracking-wider uppercase">
                                <Target size={14} className="text-primary" /> {answeredCount} Evaluated Points
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* AI Review Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    <motion.div variants={itemVariants} className="glass-panel group relative p-10 md:p-12 rounded-[3rem] overflow-hidden transition-all hover:translate-y-[-4px]">
                        <div className="absolute top-0 left-0 w-2.5 h-full bg-success/20 group-hover:bg-success/50 transition-colors"></div>
                        <div className="flex items-center gap-3 text-success mb-8 label">
                           <Trophy size={20} /> Competitive Edge
                        </div>
                        <p className="text-muted leading-relaxed text-lg font-medium">
                            {summaryGood}
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="glass-panel group relative p-10 md:p-12 rounded-[3rem] overflow-hidden transition-all hover:translate-y-[-4px]">
                        <div className="absolute top-0 left-0 w-2.5 h-full bg-warning/20 group-hover:bg-warning/50 transition-colors"></div>
                        <div className="flex items-center gap-3 text-warning mb-8 label">
                           <Activity size={20} /> Delta Optimizations
                        </div>
                        <p className="text-muted leading-relaxed text-lg font-medium">
                            {summaryMissing}
                        </p>
                    </motion.div>
                </div>

                {/* Question Details */}
                <motion.div variants={itemVariants} className="glass-panel p-10 md:p-14 rounded-[3.5rem]">
                    <div className="flex justify-between items-center mb-12">
                        <h3 className="text-3xl font-black">Technical Matrix</h3>
                        <div className="label opacity-60">Deep Dive Analysis</div>
                    </div>
                    <div className="flex flex-col gap-5">
                        {questions.map((q, idx) => (
                            <motion.div 
                                key={q.id} 
                                whileHover={{ x: 12, background: 'rgba(var(--primary-rgb), 0.03)', borderColor: 'rgba(var(--primary-rgb), 0.2)' }}
                                className="flex flex-col md:flex-row items-center justify-between p-8 bg-black/20 border border-white/5 rounded-[2rem] transition-all duration-300 group"
                            >
                                <div className="flex items-center gap-6 w-full">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary group-hover:scale-110 transition-transform shrink-0">
                                        {idx + 1}
                                    </div>
                                    <div className="min-w-0 flex flex-col gap-1">
                                         <span className="text-lg font-bold text-text-main truncate group-hover:text-primary transition-colors">
                                            {q.questionText}
                                        </span>
                                        <span className="text-xs font-bold text-muted uppercase tracking-widest opacity-60">Evaluated Response</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-10 mt-6 md:mt-0 ml-auto shrink-0 pl-6">
                                    <div className="flex flex-col items-end">
                                        <div className={`text-3xl font-black ${q.answer?.score >= 8 ? 'text-success' : q.answer?.score >= 5 ? 'text-warning' : 'text-danger'}`} style={{ color: q.answer?.score >= 8 ? '#10b981' : q.answer?.score >= 5 ? '#f59e0b' : '#ef4444' }}>
                                            {q.answer?.score || 0}<span className="text-sm text-text-subtle font-black">/10</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={24} className="text-muted opacity-40 group-hover:translate-x-2 group-hover:text-primary transition-all" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Final Actions */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-8 pb-16">
                    <motion.button 
                        whileHover={{ scale: 1.02, y: -4, boxShadow: 'var(--shadow-glow)' }}
                        whileTap={{ scale: 0.98 }}
                        className="btn btn-primary flex-1 py-6 text-xl font-black shadow-glow flex items-center justify-center gap-4 rounded-[1.5rem]"
                        onClick={() => navigate('/dashboard')}
                    >
                        <LayoutDashboard size={26} /> Command Center
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.02, y: -4, background: 'var(--glass-hover)' }}
                        whileTap={{ scale: 0.98 }}
                        className="btn btn-secondary flex-1 py-6 text-xl font-black bg-white/5 border-white/10 shadow-xl flex items-center justify-center gap-4 rounded-[1.5rem]"
                        onClick={() => navigate('/setup')}
                    >
                        <RefreshCcw size={26} /> Re-Initialize
                    </motion.button>
                </motion.div>
            </div>
        </motion.div>
    );
};


export default SessionSummary;

