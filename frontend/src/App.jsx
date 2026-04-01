import React, { Suspense, lazy, memo, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { TransitionProvider } from './components/TransitionProvider';
import Navbar from './components/Navbar';
import './index.css';

// Lazy load pages
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const InterviewPrep = lazy(() => import('./pages/InterviewPrep'));
const InterviewRoom = lazy(() => import('./pages/InterviewRoom'));
const SetupPage = lazy(() => import('./pages/SetupPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SessionSummary = lazy(() => import('./pages/SessionSummary'));

// Scroll to top on page change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  return null;
};

// Premium full-page loader
const PageLoader = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    height: '100vh', width: '100vw', gap: '1rem'
  }}>
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
    >
      <div style={{
        width: '56px', height: '56px', borderRadius: '1rem',
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 30px rgba(var(--primary-rgb), 0.4)'
      }}>
        <Loader2 size={28} color="white" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-subtle)' }}
      >
        Loading…
      </motion.div>
    </motion.div>
  </div>
);

const ProtectedRoute = memo(({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isAuthenticated ? children : <Navigate to="/" />;
});

const AdminRoute = memo(({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isAuthenticated && user?.role === 'ADMIN' ? children : <Navigate to="/dashboard" />;
});

function App() {
  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Suspense fallback={<PageLoader />}>
        <Navbar />
        <ScrollToTop />
        <main style={{ flex: 1, paddingTop: '100px' }}>
          <TransitionProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/prep" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
              <Route path="/setup" element={<ProtectedRoute><SetupPage /></ProtectedRoute>} />
              <Route path="/session/:sessionId" element={<ProtectedRoute><InterviewRoom /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
              <Route path="/session/:sessionId/summary" element={<ProtectedRoute><SessionSummary /></ProtectedRoute>} />
            </Routes>
          </TransitionProvider>
        </main>
      </Suspense>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default App;
