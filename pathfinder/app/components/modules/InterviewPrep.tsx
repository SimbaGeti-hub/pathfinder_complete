'use client';
import { useState } from 'react';
import { Mic, Send, Loader, ChevronRight, ChevronDown, ChevronUp, RotateCcw, Lightbulb, CheckCircle } from 'lucide-react';

interface Question { question: string; category: string; tip: string; sampleAnswer: string; }
interface InterviewSet { role: string; level: string; questions: Question[]; generalTips: string[]; }

const ROLES = ['Software Developer', 'Data Analyst', 'UX/UI Designer', 'Marketing Manager', 'Business Analyst', 'Teacher', 'Nurse', 'Accountant', 'Project Manager', 'Customer Service'];
const LEVELS = ['Entry Level (0-1 yr)', 'Junior (1-3 yrs)', 'Mid Level (3-5 yrs)', 'Senior (5+ yrs)'];
const CAT_COLORS: Record<string, string> = { Behavioral: '#F59E0B', Technical: '#6366F1', 'Situational': '#EC4899', 'Cultural Fit': '#00C896', General: '#8B5CF6' };

export default function InterviewPrep() {
  const [role, setRole] = useState('');
  const [level, setLevel] = useState(LEVELS[0]);
  const [loading, setLoading] = useState(false);
  const [interviewSet, setInterviewSet] = useState<InterviewSet | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!role.trim()) { setError('Please enter or select a role.'); return; }
    setError(''); setLoading(true); setInterviewSet(null);

    try {
      const prompt = `You are an expert interview coach helping students in Uganda prepare for job interviews.

Generate interview questions for: ${role} — ${level}

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "role": "${role}",
  "level": "${level}",
  "questions": [
    {
      "question": "Tell me about yourself.",
      "category": "Behavioral",
      "tip": "Short coaching tip on how to answer this",
      "sampleAnswer": "A 2-3 sentence sample answer structure"
    }
  ],
  "generalTips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4"]
}

Include exactly 6 questions across categories: Behavioral, Technical, Situational, Cultural Fit. Make them realistic for Uganda's job market.`;

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, system: 'Return only valid JSON, no markdown.' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API error');

      const jsonMatch = data.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse interview data');
      setInterviewSet(JSON.parse(jsonMatch[0]));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally { setLoading(false); }
  };

  const reset = () => { setInterviewSet(null); setRole(''); setExpanded(null); };

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EC4899' + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Mic size={18} color="#EC4899" />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>Interview Prep</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>AI-generated questions with tips and sample answers</p>
        </div>
      </div>

      {!interviewSet ? (
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>What role are you interviewing for?</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {ROLES.map(r => (
              <button key={r} onClick={() => setRole(r)} style={{ padding: '7px 14px', borderRadius: 99, border: `2px solid ${role === r ? '#EC4899' : 'var(--border)'}`, background: role === r ? '#EC489918' : 'var(--bg-input)', color: role === r ? '#EC4899' : 'var(--text-secondary)', fontSize: 13, fontWeight: role === r ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                {r}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Or type your role</label>
            <input className="input-field" placeholder="e.g. Product Manager, Lab Technician…" value={role} onChange={e => setRole(e.target.value)} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Experience Level</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {LEVELS.map(l => (
                <button key={l} onClick={() => setLevel(l)} style={{ padding: '7px 14px', borderRadius: 99, border: `2px solid ${level === l ? '#EC4899' : 'var(--border)'}`, background: level === l ? '#EC489918' : 'var(--bg-input)', color: level === l ? '#EC4899' : 'var(--text-secondary)', fontSize: 13, fontWeight: level === l ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: '#EF444418', border: '1px solid #EF444440', color: '#EF4444', fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <button className="btn-brand" onClick={handleSubmit} disabled={loading} style={{ background: '#EC4899', justifyContent: 'center', width: '100%', padding: '14px', fontSize: 15, borderRadius: 13 }}>
            {loading ? <><Loader size={16} style={{ animation: 'spin-slow 0.8s linear infinite' }} /> Generating questions…</> : <><Send size={15} /> Generate Interview Questions</>}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>{interviewSet.role} Interview</h3>
              <span className="tag tag-gray" style={{ fontSize: 11 }}>{interviewSet.level}</span>
            </div>
            <button className="btn-outline" onClick={reset} style={{ padding: '8px 14px', fontSize: 13 }}>
              <RotateCcw size={13} /> New Role
            </button>
          </div>

          {/* General Tips */}
          {interviewSet.generalTips?.length > 0 && (
            <div className="glass-card" style={{ padding: 20, marginBottom: 20, borderLeft: '4px solid #EC4899' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Lightbulb size={16} color="#EC4899" />
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>General Interview Tips</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {interviewSet.generalTips.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <CheckCircle size={13} color="#EC4899" style={{ marginTop: 2, flexShrink: 0 }} /> {tip}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {interviewSet.questions?.map((q, i) => {
              const color = CAT_COLORS[q.category] || '#00C896';
              const isOpen = expanded === i;
              return (
                <div key={i} className="glass-card" style={{ overflow: 'hidden' }}>
                  <button onClick={() => setExpanded(isOpen ? null : i)} style={{ width: '100%', padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, color }}>Q{i + 1}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>{q.question}</div>
                      <span style={{ fontSize: 11, fontWeight: 600, color, background: `${color}15`, padding: '2px 8px', borderRadius: 99, marginTop: 4, display: 'inline-block' }}>{q.category}</span>
                    </div>
                    {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
                      <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ padding: '12px 16px', borderRadius: 10, background: '#F59E0B10', border: '1px solid #F59E0B30' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em' }}>💡 Coach Tip</div>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{q.tip}</p>
                        </div>
                        <div style={{ padding: '12px 16px', borderRadius: 10, background: `${color}10`, border: `1px solid ${color}30` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em' }}>✍️ Sample Answer Structure</div>
                          <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7 }}>{q.sampleAnswer}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
