'use client';
import { useState } from 'react';
import { Zap, Send, Loader, Briefcase, TrendingUp, ChevronRight, RotateCcw, Star } from 'lucide-react';

interface CareerCard { title: string; match: number; description: string; skills: string[]; salary: string; growth: string; }

const INTERESTS_OPTIONS = [
  'Problem solving', 'Working with people', 'Creative thinking', 'Technology', 'Numbers & data',
  'Teaching others', 'Writing & communication', 'Research', 'Leadership', 'Helping communities',
  'Building things', 'Art & design', 'Business & entrepreneurship', 'Science & medicine',
];

export default function CareerRecommender() {
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [careers, setCareers] = useState<CareerCard[]>([]);
  const [rawResponse, setRawResponse] = useState('');
  const [error, setError] = useState('');

  const toggle = (item: string) => setSelected(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);

  const handleSubmit = async () => {
    const interests = [...selected, ...(custom ? [custom] : [])];
    if (interests.length === 0) { setError('Please select at least one interest.'); return; }
    setError(''); setLoading(true); setCareers([]); setRawResponse('');

    try {
      const prompt = `You are an expert career counselor specializing in Ugandan and East African job markets.

A student has these interests and strengths: ${interests.join(', ')}.

Return ONLY a valid JSON array (no markdown, no explanation) with exactly 4 career recommendations. Each object must have these exact fields:
{
  "title": "Job Title",
  "match": 92,
  "description": "2-sentence description of this career and why it fits them",
  "skills": ["skill1", "skill2", "skill3", "skill4"],
  "salary": "UGX 1.5M - 4M/month",
  "growth": "High"
}

Make the careers specific, realistic for Uganda, and genuinely matched to their interests.`;

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, system: 'You are a career counselor. Return only valid JSON arrays, nothing else.' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API error');

      const text = data.content;
      setRawResponse(text);
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Could not parse career data');
      const parsed = JSON.parse(jsonMatch[0]);
      setCareers(parsed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const reset = () => { setCareers([]); setSelected([]); setCustom(''); setRawResponse(''); setError(''); };

  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F59E0B18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="#F59E0B" />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>Career Recommender</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Select your interests and get AI-matched career paths</p>
          </div>
        </div>
      </div>

      {careers.length === 0 ? (
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>What are you interested in?</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Select all that apply — the more you pick, the better your matches.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {INTERESTS_OPTIONS.map(item => {
              const sel = selected.includes(item);
              return (
                <button key={item} onClick={() => toggle(item)} style={{ padding: '8px 14px', borderRadius: 99, border: `2px solid ${sel ? '#F59E0B' : 'var(--border-strong)'}`, background: sel ? '#F59E0B18' : 'var(--bg-input)', color: sel ? '#F59E0B' : 'var(--text-secondary)', fontSize: 13, fontWeight: sel ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                  {item}
                </button>
              );
            })}
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Anything else? (optional)</label>
            <input className="input-field" placeholder="e.g. I love farming and technology…" value={custom} onChange={e => setCustom(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: '#EF444418', border: '1px solid #EF444440', color: '#EF4444', fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <button className="btn-brand" onClick={handleSubmit} disabled={loading} style={{ background: '#F59E0B', justifyContent: 'center', width: '100%', padding: '14px', fontSize: 15, borderRadius: 13 }}>
            {loading ? <><Loader size={16} style={{ animation: 'spin-slow 0.8s linear infinite' }} /> Finding your careers…</> : <><Send size={15} /> Get My Career Matches</>}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>🎯 Your Top Career Matches</h3>
            <button className="btn-outline" onClick={reset} style={{ padding: '8px 14px', fontSize: 13, gap: 6 }}>
              <RotateCcw size={13} /> Try Again
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {careers.map((c, i) => (
              <div key={i} className="glass-card" style={{ padding: 24, borderLeft: `4px solid ${i === 0 ? '#F59E0B' : 'var(--border)'}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: i === 0 ? '#F59E0B18' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Briefcase size={16} color={i === 0 ? '#F59E0B' : 'var(--text-muted)'} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>
                        {i === 0 && <Star size={13} color="#F59E0B" fill="#F59E0B" style={{ marginRight: 5 }} />}
                        {c.title}
                      </h4>
                      {i === 0 && <span className="tag tag-brand" style={{ fontSize: 10, padding: '2px 8px' }}>Best Match</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#F59E0B', fontFamily: 'Syne, sans-serif' }}>{c.match}%</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>match score</div>
                  </div>
                </div>
                <div className="progress-bar" style={{ marginBottom: 16 }}>
                  <div className="progress-fill" style={{ width: `${c.match}%`, background: 'linear-gradient(90deg, #F59E0B, #FCD34D)' }} />
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{c.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {c.skills?.map((s: string) => <span key={s} className="tag tag-gray" style={{ fontSize: 11 }}>{s}</span>)}
                </div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>💰 Salary</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{c.salary}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <TrendingUp size={13} color="var(--brand)" />
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Growth:</span>
                    <strong style={{ color: 'var(--brand)' }}>{c.growth}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
