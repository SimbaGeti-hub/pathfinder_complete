'use client';
import { AppView } from '../page';
import ThemeToggle from './ThemeToggle';
import { Compass, Zap, Map, Mic, BookOpen, Star, ArrowRight, CheckCircle, ChevronRight, Users, TrendingUp, Award } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props { onNavigate: (v: AppView) => void; }

const HERO_WORDS = ['Career', 'Future', 'Purpose', 'Direction', 'Success'];
const FEATURES = [
  { icon: Zap, title: 'Career Matching', desc: 'Tell us your interests and strengths. Our AI maps the perfect career paths for you instantly.', color: '#F59E0B', tag: 'AI-Powered' },
  { icon: Map, title: 'Skill Roadmaps', desc: 'Get a personalized learning roadmap from beginner to job-ready with curated resources.', color: '#6366F1', tag: 'Personalized' },
  { icon: Mic, title: 'Interview Prep', desc: 'Practice with AI-generated questions tailored to your target role. Build real confidence.', color: '#EC4899', tag: 'Interactive' },
  { icon: BookOpen, title: 'Study Plans', desc: 'Weekly structured study plans that adapt to your schedule and learning pace.', color: '#00C896', tag: 'Adaptive' },
];
const TESTIMONIALS = [
  { name: 'Amara O.', role: 'Now a Software Engineer', text: 'Pathfinder showed me exactly what skills I needed and got me my first dev job in 6 months.', avatar: 'AO' },
  { name: 'Kirabo M.', role: 'UX Designer at Andela', text: 'The career roadmap was so specific and actionable. I finally had a clear plan to follow.', avatar: 'KM' },
  { name: 'David N.', role: 'Data Analyst, Kampala', text: 'The interview prep feature is incredible. I walked in confident and landed the offer.', avatar: 'DN' },
];
const STATS = [
  { value: '10K+', label: 'Students Guided', icon: Users },
  { value: '94%', label: 'Success Rate', icon: TrendingUp },
  { value: '200+', label: 'Career Paths', icon: Award },
];

export default function LandingPage({ onNavigate }: Props) {
  const [wordIdx, setWordIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setWordIdx(i => (i + 1) % HERO_WORDS.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 48px', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)', background: 'rgba(var(--bg-rgb, 247,246,242),0.85)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass size={20} color="#000" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Pathfinder</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a className="nav-link" href="#features" style={{ textDecoration: 'none' }}>Features</a>
          <a className="nav-link" href="#testimonials" style={{ textDecoration: 'none' }}>Reviews</a>
          <ThemeToggle />
          <button className="btn-outline" onClick={() => onNavigate('login')} style={{ padding: '8px 18px', fontSize: 14 }}>Log in</button>
          <button className="btn-brand" onClick={() => onNavigate('signup')} style={{ padding: '8px 18px', fontSize: 14 }}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 48px 80px', overflow: 'hidden' }}>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="hero-grid" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 820, margin: '0 auto' }}>
          <div className={`animate-fade-up ${mounted ? '' : 'opacity-0'}`} style={{ marginBottom: 20 }}>
            <span className="tag tag-brand">
              <Zap size={11} /> AI-Powered Career Coaching for Uganda
            </span>
          </div>

          <h1 className={`animate-fade-up delay-100`} style={{ fontSize: 'clamp(48px, 7vw, 88px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: 0 }}>
            Find Your
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
            <h1 style={{ fontSize: 'clamp(48px, 7vw, 88px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em' }}>
              <span className="gradient-text-animated">{HERO_WORDS[wordIdx]}</span>
            </h1>
          </div>
          <h1 className={`animate-fade-up delay-200`} style={{ fontSize: 'clamp(48px, 7vw, 88px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: 28 }}>
            With AI
          </h1>

          <p className={`animate-fade-up delay-300`} style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 44px', fontWeight: 400 }}>
            Pathfinder is your personal AI career coach — matching you to careers, building your skills, and preparing you for interviews. Made for students in Uganda.
          </p>

          <div className={`animate-fade-up delay-400`} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            <button className="btn-brand" onClick={() => onNavigate('signup')} style={{ padding: '15px 32px', fontSize: 16, borderRadius: 14 }}>
              Start for Free <ArrowRight size={16} />
            </button>
            <button className="btn-outline" onClick={() => onNavigate('login')} style={{ padding: '15px 32px', fontSize: 16, borderRadius: 14 }}>
              Sign In
            </button>
          </div>

          <div className={`animate-fade-up delay-500`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            {['No credit card needed', 'Free to start', '100% AI-powered'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
                <CheckCircle size={14} color="var(--brand)" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 48px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, textAlign: 'center' }}>
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label}>
              <Icon size={24} color="var(--brand)" style={{ margin: '0 auto 12px' }} />
              <div className="stat-number">{value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '100px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="tag tag-brand" style={{ marginBottom: 16, display: 'inline-flex' }}>What We Offer</span>
            <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Everything you need to<br /><span className="gradient-text">launch your career</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {FEATURES.map(({ icon: Icon, title, desc, color, tag }) => (
              <div key={title} className="glass-card feature-card" style={{ padding: 28 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <Icon size={22} color={color} />
                </div>
                <span className="tag tag-gray" style={{ marginBottom: 12, fontSize: 11 }}>{tag}</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.65 }}>{desc}</p>
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 4, color: color, fontSize: 13, fontWeight: 600, cursor: 'pointer' }} onClick={() => onNavigate('signup')}>
                  Try it free <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 48px', background: 'var(--bg-elevated)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <span className="tag tag-brand" style={{ marginBottom: 16, display: 'inline-flex' }}>How It Works</span>
          <h2 style={{ fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 56 }}>
            Three steps to your dream career
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, position: 'relative' }}>
            {[
              { step: '01', title: 'Share Your Interests', desc: 'Tell Pathfinder what you love, what you\'re good at, and where you want to go.' },
              { step: '02', title: 'Get Your Roadmap', desc: 'Receive a detailed, personalized career roadmap with skills, resources & timeline.' },
              { step: '03', title: 'Land the Job', desc: 'Practice interviews, build your portfolio, and land the career you deserve.' },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 800, color: 'var(--border-strong)', lineHeight: 1, marginBottom: 16 }}>{step}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" style={{ padding: '100px 48px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="tag tag-brand" style={{ marginBottom: 16, display: 'inline-flex' }}>Student Reviews</span>
            <h2 style={{ fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              Real students, <span className="gradient-text">real results</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {TESTIMONIALS.map(({ name, role, text, avatar }) => (
              <div key={name} className="glass-card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />)}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand), #4DFFD2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: '#000' }}>{avatar}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 48px', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 20 }}>
            Ready to find your<br /><span className="gradient-text">Pathfinder?</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.7, marginBottom: 36 }}>
            Join thousands of Ugandan students who found their career direction with AI.
          </p>
          <button className="btn-brand" onClick={() => onNavigate('signup')} style={{ padding: '16px 40px', fontSize: 17, borderRadius: 16 }}>
            Start Your Journey — It's Free <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 48px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Compass size={16} color="var(--brand)" />
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Pathfinder</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>© 2024 Pathfinder. Built for Uganda 🇺🇬</p>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Contact'].map(l => <a key={l} href="#" className="nav-link" style={{ fontSize: 13 }}>{l}</a>)}
        </div>
      </footer>
    </div>
  );
}
