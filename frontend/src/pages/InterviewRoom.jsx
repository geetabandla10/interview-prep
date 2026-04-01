import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Timer, Send, ChevronRight, AlertCircle, Loader2, Mic, MicOff, Sparkles, Brain, ArrowRight, Award, Lightbulb } from 'lucide-react';
import { invalidateCache } from '../utils/apiCache';

const InterviewRoom = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(120);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // 1. Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) => {
        console.error('Speech Recognition Error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your browser. Please try Chrome.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setUserAnswer(prev => prev + (prev.length > 0 ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/interviews/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSession(res.data);
      } catch (err) {
        console.error('Failed to fetch session:', err);
        setFetchError('Failed to load session details. The session may have expired or does not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId, token]);

  useEffect(() => {
    if (session && !feedback && !submitting) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [session, currentIdx, feedback, submitting]);

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    clearInterval(timerRef.current);

    const questionId = session.questions[currentIdx].id;

    setAnswers(prev => ({
      ...prev,
      [questionId]: userAnswer
    }));

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/interviews/submit`, {
        sessionId,
        questionId,
        userAnswer
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFeedback(res.data);
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Error submitting answer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < session.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setUserAnswer('');
      setFeedback(null);
      setTimeLeft(120);
    } else {
      invalidateCache('history');
      navigate(`/session/${sessionId}/summary`);
    }
  };

  if (loading) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 animate-pulse">
            <Loader2 className="animate-spin" size={48} />
        </div>
        <p className="label text-primary">Initializing AI Session...</p>
      </div>
    );
  }

  if (fetchError || !session) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-20 h-20 rounded-2xl bg-danger/10 flex items-center justify-center text-danger mb-6">
            <AlertCircle size={48} />
        </div>
        <h2 className="text-2xl font-black mb-2">Session Error</h2>
        <p className="text-muted mb-8 text-center max-w-md">{fetchError || 'Session could not be loaded.'}</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = session.questions[currentIdx];
  const progressPercent = ((currentIdx + 1) / session.questions.length) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container max-w-4xl py-12 px-4">
      {/* progress bar */}
      <div className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Brain size={16} className="text-primary" />
              <span className="label text-primary">Technical Evaluation Matrix</span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">Question {currentIdx + 1} of {session.questions.length}</h3>
          </div>
          <span className="text-xs font-black text-muted tracking-widest">{Math.round(progressPercent)}% COMPLETION</span>
        </div>
        <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-glow"
            transition={{ type: 'spring', stiffness: 40, damping: 15 }}
          />
        </div>
      </div>

      <motion.div 
        layout
        className="glass-panel relative overflow-hidden" 
        style={{ padding: 'clamp(2rem, 6vw, 3.5rem)', borderRadius: '2.5rem' }}
      >
        <div className="orb orb-primary" style={{ top: '-15%', right: '-10%', width: '250px', height: '250px', opacity: 0.1 }}></div>
        
        <AnimatePresence mode="wait">
          {!feedback ? (
            <motion.div
              key="question-area"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                <div className="flex gap-5 items-start">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-primary/30 shrink-0">
                    {currentIdx + 1}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black leading-tight tracking-tight mt-1">
                    {currentQuestion.questionText}
                  </h2>
                </div>
                
                <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border ${timeLeft < 30 ? 'bg-danger/10 border-danger text-danger animate-pulse' : 'bg-white/5 border-white/10 text-text-main'} font-extrabold text-sm shadow-sm transition-colors`}>
                  <Timer size={18} />
                  <span className="mono">{formatTime(timeLeft)}</span>
                </div>
              </div>

              <div className="relative group">
                <textarea 
                  className="w-full min-h-[280px] p-8 bg-black/20 border-2 border-white/10 rounded-[2rem] text-text-main text-lg leading-relaxed focus:border-primary/50 focus:bg-black/30 transition-all outline-none resize-none shadow-inner"
                  placeholder="Articulate your thought process here. Use technical terminology to demonstrate depth…"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={submitting}
                />
                
                <div className="absolute top-5 right-5 flex gap-2.5">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleListening}
                    className={`p-3.5 rounded-2xl border-2 transition-all ${isListening ? 'bg-danger border-danger text-white shadow-glow' : 'bg-white/5 border-white/10 text-text-muted hover:text-text-main hover:bg-white/10'}`}
                    title={isListening ? "Stop Dictation" : "Start Dictation"}
                  >
                    {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                  </motion.button>
                </div>

                <div className="absolute bottom-5 right-8 label opacity-40">
                  {userAnswer.length} chars
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={submitting || !userAnswer.trim()}
                className="btn btn-primary w-full py-5 text-xl font-black mt-10 shadow-glow flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <><Loader2 className="animate-spin" size={24} /> Synthesizing Analysis…</>
                ) : (
                  <><Send size={24} className="rotate-45" /> Submit Response</>
                )}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="feedback-area"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-10 pb-10 border-b border-white/10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary shadow-glow">
                    <Sparkles size={40} />
                  </div>
                  <div>
                    <span className="label text-primary block mb-1">AI Evaluation Matrix</span>
                    <h2 className="text-3xl font-black">Performance Pulse</h2>
                  </div>
                </div>
                
                <div className="flex flex-col items-center md:items-end">
                  <div className={`text-6xl font-black ${feedback.score >= 8 ? 'text-success' : feedback.score >= 5 ? 'text-warning' : 'text-danger'}`}>
                    {feedback.score}<span className="text-2xl text-text-subtle font-bold">/10</span>
                  </div>
                  <div className="label mt-1">Difficulty: {session.difficulty}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="p-8 bg-success/5 border border-success/10 rounded-[2rem] transition-colors hover:bg-success/8">
                  <div className="flex items-center gap-2 text-success label mb-5">
                    <Award size={18} /> Execution Strengths
                  </div>
                  <p className="text-text-muted leading-relaxed text-base font-medium">{feedback.good}</p>
                </div>

                <div className="p-8 bg-warning/5 border border-warning/10 rounded-[2rem] transition-colors hover:bg-warning/8">
                  <div className="flex items-center gap-2 text-warning label mb-5">
                    <AlertCircle size={18} /> Delta Points
                  </div>
                  <p className="text-text-muted leading-relaxed text-base font-medium">{feedback.missing}</p>
                </div>
              </div>

              <div className="mb-12">
                <div className="flex items-center gap-2 text-primary label mb-5 px-3">
                  <Lightbulb size={18} /> Optimal Solution Pattern
                </div>
                <div className="p-10 bg-white/2 border-2 border-dashed border-white/10 rounded-[2.5rem] relative group">
                   <span className="absolute top-0 left-10 -translate-y-1/2 px-4 bg-white/5 border border-white/10 rounded-full text-xs font-black text-primary backdrop-blur-md">EXPERT REFERENCE</span>
                   <p className="text-text-muted italic leading-loose text-lg font-medium opacity-80">
                     {feedback.ideal}
                   </p>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="btn btn-secondary w-full py-5 text-xl font-black shadow-xl flex items-center justify-center gap-4"
              >
                {currentIdx < session.questions.length - 1 ? (
                  <>Progress to Next Tier <ArrowRight size={24} /></>
                ) : (
                  <>Generate Final Assessment <Award size={24} /></>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};


export default InterviewRoom;

