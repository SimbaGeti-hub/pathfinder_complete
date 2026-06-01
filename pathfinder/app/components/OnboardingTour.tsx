'use client';
import { useState, useEffect } from 'react';
import { Compass, X, ArrowRight, Zap, Map, Mic, BookOpen, Bot, FileText, Trophy, Bookmark } from 'lucide-react';

const STEPS = [
  { title: 'Welcome to Pathfinder! 🧭', desc: 'Your personal AI career coach built for students in Uganda. Let us show you around in 30 seconds.', icon: Compass, color: 'var(--brand)', position: 'center' },
  { title: 'Career Recommender ⚡', desc: 'Tell us your interests and our AI instantly matches you to the best career paths with salary info and growth data.', icon: Zap, color: '#F59E0B', position: 'center' },
  { title: 'Skill Roadmap 🗺️', desc: 'Pick any career and get a detailed phase-by-phase learning plan with resources — from zero to job-ready.', icon: Map, color: '#6366F1', position: 'center' },
  { title: 'Interview Prep 🎤', desc: 'Get AI-generated interview questions for any role, complete with coaching tips and sample answers.', icon: Mic, color: '#EC4899', position: 'center' },
  { title: 'AI Chatbot 🤖', desc: 'Ask Pathfinder AI anything — career advice, CV tips, salary questions, job market insights. Available 24/7.', icon: Bot, color: 'var(--brand)', position: 'center' },
  { title: 'CV Builder 📄', desc: 'Build a professional CV in minutes with our step-by-step builder. AI writes your summary for you!', icon: FileText, color: '#8B5CF6', position: 'center' },
  { title: 'You\'re all set! 🎉', desc: 'Start with Career Recommender to find your best career match. Your journey to success starts now!', icon: Compass, color: 'var(--brand)', position: 'center' },
];

const TOUR_KEY = 'pathfinder-tour-done';

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) setTimeout(() => setVisible(true), 800);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(TOUR_KEY, 'true');
  };

  const next = () => {
    if (step === STEPS.length - 1) { dismiss(); return; }
    setAnimating(true);
    setTimeout(() => { setStep(s => s + 1); setAnimating(false); }, 200);
  };

  const prev = () => {
    if (step === 0) return;
    setAnimating(true);
    setTimeout(() => { setStep(s => s - 1); setAnimating(false); }, 200);
  };

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 460, boxShadow: 'var(--shadow-lg)', position: 'relative', opacity: animating ? 0 : 1, transform: animating ? 'scale(0.96)' : 'scale(1)', transition: 'all 0.2s ease' }}>
        {/* Skip */}
        <button onClick={dismiss} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--bg-elevated)', border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
          <X size={12} /> Skip tour
        </button>

        {/* Step dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div key={i} onClick={() => setStep(i)} style={{ height: 4, borderRadius: 99, background: i === step ? current.color : 'var(--border)', flex: i === step ? 2 : 1, transition: 'all 0.3s ease', cursor: 'pointer' }} />
          ))}
        </div>

        {/* Icon */}
        <div style={{ width: 64, height: 64, borderRadius: 18, background: `${current.color}15`, border: `2px solid ${current.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Icon size={28} color={current.color} />
        </div>

        {/* Content */}
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 10 }}>
          {current.title}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
          {current.desc}
        </p>

        {/* Step counter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{step + 1} of {STEPS.length}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button onClick={prev} className="btn-outline" style={{ padding: '10px 18px', fontSize: 14 }}>Back</button>
            )}
            <button onClick={next} className="btn-brand" style={{ padding: '10px 22px', fontSize: 14, background: current.color }}>
              {isLast ? '🚀 Let\'s Start!' : <>Next <ArrowRight size={14} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
