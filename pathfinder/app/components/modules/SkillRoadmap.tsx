'use client';
import { useState } from 'react';
import { Map, Send, Loader, ChevronDown, ChevronUp, CheckCircle, Clock, RotateCcw, BookOpen } from 'lucide-react';

interface Phase { title: string; duration: string; skills: string[]; resources: string[]; milestone: string; }
interface Roadmap { career: string; totalDuration: string; overview: string; phases: Phase[]; }

const POPULAR_CAREERS = ['Software Developer', 'Data Analyst', 'UX Designer', 'Business Analyst', 'Digital Marketer', 'Accountant', 'Nurse / Healthcare', 'Teacher / Educator', 'Agricultural Scientist', 'Lawyer'];
const PHASE_COLORS = ['#6366F1', '#F59E0B', '#EC4899', '#00C896', '#8B5CF6'];

export default function SkillRoadmap() {
  const [career, setCareer] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<number[]>([0]);

  const toggleExpand = (i: number) => setExpanded(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const handleSubmit = async () => {
    if (!career.trim()) { setError('Please enter or select a career.'); return; }
    setError(''); setLoading(true); setRoadmap(null);

    try {
      const prompt = `You are an expert career coach for students in Uganda and East Africa.

Create a detailed skill-building roadmap for someone who wants to become a: ${career}

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "career": "${career}",
  "totalDuration": "12 months",
  "overview": "2-sentence overview of this career path",
  "phases": [
    {
      "title": "Phase 1: Foundation",
      "duration": "2 months",
      "skills": ["skill1", "skill2", "skill3"],
      "resources": ["Free resource 1", "YouTube channel", "Book/Course name"],
      "milestone": "What you can do after this phase"
    }
  ]
}

Include exactly 4 phases. Make it realistic, practical, and specific to the Ugandan context where possible.`;

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, system: 'Return only valid JSON, no markdown, no explanation.' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API error');

      const jsonMatch = data.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse roadmap');
      setRoadmap(JSON.parse(jsonMatch[0]));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally { setLoading(false); }
  };

  const reset = () => { setRoadmap(null); setCareer(''); setExpanded([0]); };

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#6366F118', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Map size={18} color="#6366F1" />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>Skill Roadmap</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Get a personalized step-by-step learning plan for any career</p>
        </div>
      </div>

      {!roadmap ? (
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Which career do you want to build skills for?</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {POPULAR_CAREERS.map(c => (
              <button key={c} onClick={() => setCareer(c)} style={{ padding: '7px 14px', borderRadius: 99, border: `2px solid ${career === c ? '#6366F1' : 'var(--border)'}`, background: career === c ? '#6366F118' : 'var(--bg-input)', color: career === c ? '#6366F1' : 'var(--text-secondary)', fontSize: 13, fontWeight: career === c ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                {c}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Or type your own career</label>
            <input className="input-field" placeholder="e.g. AI Engineer, Social Worker, Journalist…" value={career} onChange={e => setCareer(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: '#EF444418', border: '1px solid #EF444440', color: '#EF4444', fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <button className="btn-brand" onClick={handleSubmit} disabled={loading} style={{ background: '#6366F1', justifyContent: 'center', width: '100%', padding: '14px', fontSize: 15, borderRadius: 13 }}>
            {loading ? <><Loader size={16} style={{ animation: 'spin-slow 0.8s linear infinite' }} /> Building your roadmap…</> : <><Send size={15} /> Generate My Roadmap</>}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif', marginBottom: 4 }}>{roadmap.career} Roadmap</h3>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-muted)' }}>
                  <Clock size={13} /> {roadmap.totalDuration}
                </div>
                <span className="tag tag-brand" style={{ fontSize: 11 }}>AI Generated</span>
              </div>
            </div>
            <button className="btn-outline" onClick={reset} style={{ padding: '8px 14px', fontSize: 13 }}>
              <RotateCcw size={13} /> New Roadmap
            </button>
          </div>

          <div className="glass-card" style={{ padding: 20, marginBottom: 20, borderLeft: '4px solid #6366F1' }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{roadmap.overview}</p>
          </div>

          {/* Timeline */}
          <div style={{ position: 'relative' }}>
            {roadmap.phases?.map((phase, i) => {
              const color = PHASE_COLORS[i % PHASE_COLORS.length];
              const isOpen = expanded.includes(i);
              return (
                <div key={i} style={{ position: 'relative', marginBottom: 16 }}>
                  {i < (roadmap.phases?.length || 0) - 1 && (
                    <div style={{ position: 'absolute', left: 19, top: 52, bottom: -16, width: 2, background: `${color}30`, zIndex: 0 }} />
                  )}
                  <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <button onClick={() => toggleExpand(i)} style={{ width: '100%', padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${color}18`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color }}>{i + 1}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>{phase.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <Clock size={11} /> {phase.duration}
                        </div>
                      </div>
                      {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                    </button>

                    {isOpen && (
                      <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          <div>
                            <h5 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skills to Learn</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {phase.skills?.map((s: string) => (
                                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-primary)' }}>
                                  <CheckCircle size={13} color={color} /> {s}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resources</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {phase.resources?.map((r: string) => (
                                <div key={r} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                                  <BookOpen size={13} color="var(--text-muted)" style={{ marginTop: 1, flexShrink: 0 }} /> {r}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: `${color}10`, border: `1px solid ${color}30` }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🎯 Milestone: </span>
                          <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{phase.milestone}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
