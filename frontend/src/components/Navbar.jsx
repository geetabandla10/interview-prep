import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, Menu, X, LayoutDashboard, History,
  LogOut, Award, ChevronRight, Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setIsOpen(false), [location.pathname]);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'History', path: '/history', icon: History },
    { name: 'Prep', path: '/prep', icon: Sparkles },
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        padding: scrolled ? '0.625rem 0' : '1rem 0',
      }}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: scrolled
              ? 'var(--glass)'
              : 'transparent',
            backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
            border: scrolled ? '1px solid var(--border)' : '1px solid transparent',
            borderRadius: '1.25rem',
            boxShadow: scrolled ? 'var(--shadow)' : 'none',
            padding: '0.625rem 1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'}>
            <motion.div
              style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', boxShadow: '0 4px 16px rgba(var(--primary-rgb), 0.4)',
                flexShrink: 0
              }}>
                <Award size={20} />
              </div>
              <span style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.2rem',
                letterSpacing: '-0.03em'
              }}
                className="hidden sm:block"
              >
                AI<span className="text-gradient">Coach</span>
              </span>
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          {isAuthenticated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              className="hidden md:flex"
            >
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link key={link.name} to={link.path}>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.75rem',
                        fontSize: '0.9rem', fontWeight: 600,
                        background: active ? 'var(--primary)' : 'transparent',
                        color: active ? '#fff' : 'var(--text-muted)',
                        boxShadow: active ? '0 4px 16px rgba(var(--primary-rgb), 0.35)' : 'none',
                        transition: 'all 0.25s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                        if (!active) e.currentTarget.style.color = 'var(--text-main)';
                      }}
                      onMouseLeave={(e) => {
                        if (!active) e.currentTarget.style.background = 'transparent';
                        if (!active) e.currentTarget.style.color = 'var(--text-muted)';
                      }}
                    >
                      <link.icon size={16} />
                      {link.name}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.88 }}
              style={{
                width: '38px', height: '38px', borderRadius: '0.75rem',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(var(--primary-rgb), 0.1)';
                e.currentTarget.style.color = 'var(--primary)';
                e.currentTarget.style.borderColor = 'rgba(var(--primary-rgb), 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                {/* User info */}
                <div style={{ textAlign: 'right' }} className="hidden sm:block">
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.2 }}>{user?.displayName?.split(' ')[0]}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>{user?.email?.split('@')[0]}@…</p>
                </div>

                {/* Avatar */}
                <motion.div whileHover={{ scale: 1.05 }} style={{ cursor: 'default' }}>
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL} alt={user.displayName}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid rgba(var(--primary-rgb), 0.35)', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'rgba(var(--primary-rgb), 0.2)',
                      border: '2px solid rgba(var(--primary-rgb), 0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--primary)', fontWeight: 800, fontSize: '0.875rem'
                    }}>
                      {user?.displayName?.[0] || 'U'}
                    </div>
                  )}
                </motion.div>

                {/* Logout */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  title="Logout"
                  style={{
                    width: '36px', height: '36px', borderRadius: '0.625rem',
                    background: 'transparent', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)', cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  className="hidden md:flex"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <LogOut size={18} />
                </motion.button>
              </div>
            ) : (
              <Link to="/">
                <motion.div
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
                >
                  Sign In
                </motion.div>
              </Link>
            )}

            {/* Mobile Hamburger */}
            {isAuthenticated && (
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: '38px', height: '38px', borderRadius: '0.75rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-main)', cursor: 'pointer'
                }}
                className="md:hidden"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isOpen ? 'close' : 'open'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="container" style={{ marginTop: '0.5rem' }}>
              <div style={{
                background: 'var(--glass)', backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid var(--border)', borderRadius: '1.25rem',
                padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem',
                boxShadow: 'var(--shadow-strong)'
              }}>
                {navLinks.map((link, i) => {
                  const active = isActive(link.path);
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '0.875rem 1rem', borderRadius: '0.875rem',
                          background: active ? 'var(--primary)' : 'transparent',
                          color: active ? '#fff' : 'var(--text-muted)',
                          fontWeight: 600, fontSize: '0.95rem',
                          transition: 'all 0.2s ease',
                          textDecoration: 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <link.icon size={19} />
                          {link.name}
                        </div>
                        <ChevronRight size={16} style={{ opacity: 0.5 }} />
                      </Link>
                    </motion.div>
                  );
                })}

                <div style={{ height: '1px', background: 'var(--border)', margin: '0.25rem 0' }} />

                <motion.button
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.06, duration: 0.3 }}
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.875rem 1rem', borderRadius: '0.875rem',
                    background: 'transparent', border: 'none',
                    color: '#ef4444', fontWeight: 600, fontSize: '0.95rem',
                    cursor: 'pointer', transition: 'background 0.2s ease',
                    width: '100%', textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={19} />
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
