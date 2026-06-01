'use client';
import { useState, useEffect } from 'react';
import { Trophy, CheckCircle, Circle, TrendingUp, Star, RotateCcw, Lock } from 'lucide-react';

interface TrackedSkill { name: string; done: boolean; }
interface TrackedPhase { title: string; skills: TrackedSkill[]; }
interface TrackedCareer { career: string; phases: TrackedPhase[]; startedAt: string; }

const DEMO_CAREERS: TrackedCareer[] = [
  {
    career: 'Software Developer',
    startedAt: new Date().toLocaleDateString('en-UG'),
    phases: [
      { title: 'Phase 1: Foundation', skills: [{ name: 'HTML & CSS Basics', done: false }, { name: 'JavaScript Fundamentals', done: false }, { name: 'Git & GitHub', done: false }, { name: 'Command Line Basics', done: false }] },
      { title: 'Phase 2: Core Skills', skills: [{ name: 'React or Vue.js', done: false }, { name: 'Node.js & Express', done: false }, { name: 'REST APIs', done: false }, { name: 'Database Basics (SQL)', done: false }] },
      { title: 'Phase 3: Professional', skills: [{ name: 'Build 3 Projects', done: false }, { name: 'Deploy to Cloud', done: false }, { name: 'Code Review Practice', done: false }, { name: 'Technical Interviews', done: false }] },
      { title: 'Phase 4: Job Ready', skills: [{ name: 'Portfolio Website', done: false }, { name: 'LinkedIn Profile', done: false }, { name: 'Apply to 10 Jobs', done: false }, { name: 'Negotiate Offer', done: false }] },
    ],
  },
];

const STORAGE_KEY = 'pathfinder-progress';
const PHASE_COLORS = ['#6366F1', '#F59E0B', '#EC4899', '#00C896'];

export default function ProgressTracker() {
  const [careers, setCareers] = useState<TrackedCareer[]>([]);
  const [active, setActive] = useState(0);
  const [newCareer, setNewCareer] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { try { setCareers(JSON.parse(saved)); } catch { setCareers(DEMO_CAREERS); } }
    else { setCareers(DEMO_CAREERS); localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_CAREERS)); }
  }, []);

  const save = (updated: TrackedCareer[]) => {
    setCareers(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const toggleSkill = (phaseIdx: number, skillIdx: number) => {
    const updated = careers.map((c, ci) => {
      if (ci !== active) return c;
      const phases = c.phases.map((p, pi) => {
        if (pi !== phaseIdx) return p;
        const skills = p.skills.map((s, si) => si === skillIdx ? { ...s, done: !s.done } : s);
        return { ...p, skills };
      });
      return { ...c, phases };
    });
    save(updated);
  };

  const addCareer = () => {
    if (!newCareer.trim()) return;
    const career: TrackedCareer = {
      career: newCareer.trim(),
      startedAt: new Date().toLocaleDateString('en-UG'),
      phases: [
        { title: 'Phase 1: Foundation', skills: [{ name: 'Research the field', done: false }, { name: 'Find learning resources', done: false }, { name: 'Set weekly goals', done: false }] },
        { title: 'Phase 2: Core Learning', skills: [{ name: 'Complete first course', done: false }, { name: 'Build a project', done: false }, { name: 'Join a community', done: false }] },
        { title: 'Phase 3: Practice', skills: [{ name: 'Apply skills daily', done: false }, { name: 'Get feedback', done: false }, { name: 'Update your CV', done: false }] },
        { title: 'Phase 4: Job Ready', skills: [{ name: 'Polish portfolio', done: false }, { name: 'Network actively', done: false }, { name: 'Start applying', done: false }] },
      ],
    };
    const updated = [...careers, career];
    save(updated);
    setActive(updated.length - 1);
    setNewCareer('');
    setAdding(false);
  };

  const resetProgress = () => {
    const updated = careers.map((c, ci) => {
      if (ci !== active) return c;
      return { ...c, phases: c.phases.map(p => ({ ...p, skills: p.skills.map(s => ({ ...s, done: false })) })) };
    });
    save(updated);
  };

  if (careers.length === 0) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading…</div>;

  const current = careers[active];
  const totalSkills = current.phases.reduce((a, p) => a + p.skills.length, 0);
  const doneSkills = current.phases.reduce((a, p) => a + p.skills.filter(s => s.done).length, 0);
  const overallPct = Math.round((doneSkills / totalSkills) * 100);

  const phaseProgress = (phase: TrackedPhase) => {
    const done = phase.skills.filter(s => s.done).length;
    return { done, total: phase.skills.length, pct: Math.round((done / phase.skills.length) * 100) };
  };

  const isPhaseUnlocked = (i: number) => {
    if (i === 0) return true;
    const prev = current.phases[i - 1];
    return prev.skills.every(s => s.done);
  };

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F59E0B18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trophy size={18} color="#F59E0B" />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>Progress Tracker</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Track your skills and celebrate every milestone</p>
        </div>
      </div>

      {/* Career tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {careers.map((c, i) => (
          <button key={i} onClick={() => setActive(i)} style={{ padding: '8px 16px', borderRadius: 99, border: `2px solid ${active === i ? '#F59E0B' : 'var(--border)'}`, background: active === i ? '#F59E0B18' : 'var(--bg-input)', color: active === i ? '#F59E0B' : 'var(--text-secondary)', fontSize: 13, fontWeight: active === i ? 700 : 400, cursor: 'pointer', transition: 'all 0.2s ease' }}>
            {c.career}
          </button>
        ))}
        {adding ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <input className="input-field" placeholder="Career name…" value={newCareer} onChange={e => setNewCareer(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCareer()} style={{ width: 180, padding: '8px 12px', fontSize: 13 }} autoFocus />
            <button className="btn-brand" onClick={addCareer} style={{ padding: '8px 14px', fontSize: 13 }}>Add</button>
            <button className="btn-ghost" onClick={() => setAdding(false)} style={{ padding: '8px 10px' }}>✕</button>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="btn-outline" style={{ padding: '7px 14px', fontSize: 13, borderRadius: 99 }}>+ New Career</button>
        )}
      </div>

      {/* Overall progress */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20, background: 'linear-gradient(135deg, #0D1F1A, #0A2A1A)', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Overall Progress</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#fff' }}>{overallPct}% Complete</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{doneSkills} of {totalSkills} skills done · Started {current.startedAt}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: `conic-gradient(var(--brand) ${overallPct * 3.6}deg, rgba(255,255,255,0.1) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#0D1F1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {overallPct === 100 ? <Star size={20} color="#F59E0B" fill="#F59E0B" /> : <TrendingUp size={18} color="var(--brand)" />}
              </div>
            </div>
          </div>
        </div>
        <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, var(--brand), #4DFFD2)', width: `${overallPct}%`, transition: 'width 1s ease' }} />
        </div>
        {overallPct === 100 && <div style={{ marginTop: 12, textAlign: 'center', color: '#F59E0B', fontWeight: 700, fontSize: 14 }}>🎉 Congratulations! You've completed this roadmap!</div>}
      </div>

      {/* Phase cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {current.phases.map((phase, pi) => {
          const { done, total, pct } = phaseProgress(phase);
          const color = PHASE_COLORS[pi % PHASE_COLORS.length];
          const unlocked = isPhaseUnlocked(pi);
          return (
            <div key={pi} className="glass-card" style={{ padding: 20, opacity: unlocked ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${color}18`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!unlocked ? <Lock size={13} color={color} /> : pct === 100 ? <CheckCircle size={14} color={color} /> : <span style={{ fontSize: 12, fontWeight: 800, color }}>{pi + 1}</span>}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>{phase.title}</div>
                    {!unlocked && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Complete Phase {pi} to unlock</div>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color, fontFamily: 'Syne, sans-serif' }}>{pct}%</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{done}/{total}</div>
                </div>
              </div>
              <div className="progress-bar" style={{ marginBottom: 14 }}>
                <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
              </div>
              {unlocked && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {phase.skills.map((skill, si) => (
                    <button key={si} onClick={() => toggleSkill(pi, si)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, border: `1px solid ${skill.done ? color : 'var(--border)'}`, background: skill.done ? `${color}10` : 'var(--bg-input)', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left' }}>
                      {skill.done ? <CheckCircle size={14} color={color} /> : <Circle size={14} color="var(--text-muted)" />}
                      <span style={{ fontSize: 13, color: skill.done ? color : 'var(--text-secondary)', fontWeight: skill.done ? 600 : 400 }}>{skill.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <button className="btn-ghost" onClick={resetProgress} style={{ fontSize: 13, color: '#EF4444', gap: 6 }}>
          <RotateCcw size={13} /> Reset Progress
        </button>
      </div>
    </div>
  );
}
