'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, User, Mail, ArrowRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GoogleNameModal() {
  const { pendingGoogleUser, completeGoogleSignIn, cancelGoogleSignIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({ name: '', email: '' });
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pendingGoogleUser) {
      setName('');
      setEmail('');
      setErrors({ name: '', email: '' });
      requestAnimationFrame(() => setVisible(true));
      setTimeout(() => nameRef.current?.focus(), 120);
    } else {
      setVisible(false);
    }
  }, [pendingGoogleUser]);

  if (!pendingGoogleUser) return null;

  const validate = () => {
    const e = { name: '', email: '' };
    if (!name.trim()) e.name = 'Please enter your name';
    if (!email.trim()) e.email = 'Please enter your email';
    else if (!email.includes('@') || !email.includes('.')) e.email = 'Please enter a valid email address';
    setErrors(e);
    return !e.name && !e.email;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    // Pass name AND email directly — no stale state mutation
    completeGoogleSignIn(name.trim(), email.trim().toLowerCase());
    toast.success(`Welcome to Pathfinder, ${name.split(' ')[0]}! 🎉`);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') cancelGoogleSignIn();
  };

  return (
    <div
      onClick={cancelGoogleSignIn}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-strong)',
          borderRadius: 24,
          padding: '40px 36px',
          width: '100%', maxWidth: 440,
          boxShadow: 'var(--shadow-lg)',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.95)',
          transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={cancelGoogleSignIn}
          style={{ position: 'absolute', top: 16, right: 16, background: 'var(--bg-elevated)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
        >
          <X size={15} />
        </button>

        {/* Google badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #4285F4, #34A853)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--border-strong)', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={12} color="#000" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, color: 'var(--text-primary)' }}>Pathfinder</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--brand)', marginTop: 2, fontWeight: 600 }}>✓ Google connected</div>
          </div>
        </div>

        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 8 }}>
          Almost there!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          Enter your name and the Gmail address you used so we can set up your account correctly.
        </p>

        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>Full Name</label>
          <div style={{ position: 'relative' }}>
            <User size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              ref={nameRef}
              className="input-field"
              type="text"
              placeholder="e.g. Veronica Mirembe"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }}
              onKeyDown={handleKey}
              style={{ paddingLeft: 42, borderColor: errors.name ? '#EF4444' : undefined }}
            />
          </div>
          {errors.name && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 5 }}>{errors.name}</p>}
        </div>

        {/* Email */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>Gmail Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input-field"
              type="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
              onKeyDown={handleKey}
              style={{ paddingLeft: 42, borderColor: errors.email ? '#EF4444' : undefined }}
            />
          </div>
          {errors.email
            ? <p style={{ fontSize: 12, color: '#EF4444', marginTop: 5 }}>{errors.email}</p>
            : <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>This will show in your profile and dashboard.</p>
          }
        </div>

        <button
          className="btn-brand"
          onClick={handleSubmit}
          style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, borderRadius: 13 }}
        >
          Let's Go <ArrowRight size={16} />
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
          You can update your details anytime in settings.
        </p>
      </div>
    </div>
  );
}
