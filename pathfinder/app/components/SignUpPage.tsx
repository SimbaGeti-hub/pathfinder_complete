'use client';
import { useState } from 'react';
import { AppView } from '../page';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { Compass, Mail, Lock, User, Eye, EyeOff, ArrowLeft, Loader, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props { onNavigate: (v: AppView) => void; }

const INTERESTS = [
  '💻 Technology', '📊 Business', '🏥 Healthcare', '🎨 Design',
  '📚 Education', '🌾 Agriculture', '⚖️ Law', '💰 Finance',
  '🎭 Arts & Media', '🔬 Science', '🏗️ Engineering', '🌍 Social Work'
];

export default function SignUpPage({ onNavigate }: Props) {
  const { signUp, signInWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [step, setStep] = useState(1);

  const toggleInterest = (i: string) => {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const handleNext = () => {
    if (!name) { toast.error('Please enter your name'); return; }
    if (!email) { toast.error('Please enter your email'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (interests.length === 0) { toast.error('Pick at least one interest'); return; }
    setLoading(true);
    try {
      await signUp(name, email, password, interests);
      toast.success('Welcome to Pathfinder! 🎉');
    } catch {
      toast.error('Sign up failed. Try again.');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      // Pass the email they already typed so the modal can pre-fill it
      await signInWithGoogle();
    } catch {
      toast.error('Google sign-up failed. Please try again.');
    } finally { setGoogleLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-1" style={{ zIndex: 0 }} />
      <div className="orb orb-2" style={{ zIndex: 0 }} />

      <div style={{ width: '100%', maxWidth: 500, position: 'relative', zIndex: 1 }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <button className="btn-ghost" onClick={() => step === 1 ? onNavigate('landing') : setStep(1)} style={{ padding: '6px 10px' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: step >= s ? 'var(--brand)' : 'var(--bg-elevated)', border: `2px solid ${step >= s ? 'var(--brand)' : 'var(--border-strong)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: step >= s ? '#000' : 'var(--text-muted)', transition: 'all 0.3s ease' }}>
                  {step > s ? <Check size={12} /> : s}
                </div>
                {s < 2 && <div style={{ width: 32, height: 2, background: step > s ? 'var(--brand)' : 'var(--border)', borderRadius: 99, transition: 'all 0.3s ease' }} />}
              </div>
            ))}
          </div>
          <ThemeToggle />
        </div>

        <div className="glass-card animate-scale-in" style={{ padding: '40px 36px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Compass size={16} color="#000" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>Pathfinder</span>
          </div>

          {step === 1 ? (
            <>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 6 }}>Create your account</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
                Already have one?{' '}
                <button onClick={() => onNavigate('login')} style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontWeight: 600, fontSize: 14, padding: 0 }}>Sign in →</button>
              </p>

              {/* Google */}
              <button className="btn-google" onClick={handleGoogle} disabled={googleLoading} style={{ marginBottom: 20 }}>
                {googleLoading ? <Loader size={16} style={{ animation: 'spin-slow 0.8s linear infinite' }} /> : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                {googleLoading ? 'Connecting…' : 'Continue with Google'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>or with email</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input-field" type="text" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} style={{ paddingLeft: 40 }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: 40 }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input-field" type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingLeft: 40, paddingRight: 42 }} />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <button className="btn-brand" onClick={handleNext} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, borderRadius: 13, marginTop: 24 }}>
                Continue →
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 8 }}>What are you into?</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Pick your interests so we can personalize your career guidance.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 28 }}>
                {INTERESTS.map(interest => {
                  const selected = interests.includes(interest);
                  return (
                    <button key={interest} type="button" onClick={() => toggleInterest(interest)} style={{ padding: '10px 14px', borderRadius: 12, border: `2px solid ${selected ? 'var(--brand)' : 'var(--border)'}`, background: selected ? 'var(--brand-subtle)' : 'var(--bg-input)', color: selected ? 'var(--brand)' : 'var(--text-secondary)', fontSize: 13, fontWeight: selected ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {selected && <Check size={12} />}
                      {interest}
                    </button>
                  );
                })}
              </div>
              <div style={{ marginBottom: 20, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-elevated)', fontSize: 13, color: 'var(--text-muted)' }}>
                {interests.length === 0 ? 'Select at least 1 interest' : `${interests.length} selected — great choices!`}
              </div>
              <button className="btn-brand" type="submit" disabled={loading || interests.length === 0} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, borderRadius: 13, opacity: interests.length === 0 ? 0.5 : 1 }}>
                {loading ? <><Loader size={16} style={{ animation: 'spin-slow 0.8s linear infinite' }} /> Creating account…</> : 'Create My Account 🎉'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
