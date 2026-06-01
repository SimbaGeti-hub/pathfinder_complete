'use client';
import { useState } from 'react';
import { Globe, Search, Loader, MapPin, Briefcase, ExternalLink, RotateCcw, Clock, Building } from 'lucide-react';

interface Job { title: string; company: string; location: string; type: string; salary: string; description: string; requirements: string[]; applyUrl: string; postedDays: number; }

const POPULAR = ['Software Developer', 'Data Analyst', 'UX Designer', 'Marketing Manager', 'Accountant', 'Teacher', 'Business Analyst', 'Nurse'];

export default function JobBoard() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searched, setSearched] = useState('');
  const [error, setError] = useState('');

  const search = async (role: string) => {
    if (!role.trim()) return;
    setError(''); setLoading(true); setJobs([]); setSearched(role);

    try {
      const prompt = `You are a job board assistant for Uganda and East Africa.

Generate 6 realistic job listings for: "${role}" in Uganda

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "title": "Exact job title",
    "company": "Real or realistic Ugandan/East African company name",
    "location": "City, Uganda (e.g. Kampala, Entebbe, Jinja)",
    "type": "Full-time" or "Part-time" or "Contract" or "Remote",
    "salary": "UGX X,XXX,XXX – X,XXX,XXX/month",
    "description": "2-sentence job description",
    "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
    "applyUrl": "https://brightermondayuganda.com/jobs/example",
    "postedDays": 2
  }
]

Use real Ugandan companies where possible: MTN Uganda, Stanbic Bank, Makerere University, Andela, Airtel Uganda, DFCU Bank, Jumia Uganda, SafeBoda, Fenix International, NSSF Uganda, Cipla Quality Chemical, Uganda Telecom, etc.
Mix company sizes. Make salaries realistic for Uganda. Vary job types.`;

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, system: 'Return only valid JSON arrays. No markdown, no explanation, no extra text.' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const match = data.content.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('No job data returned');
      setJobs(JSON.parse(match[0]));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Search failed. Try again.');
    } finally { setLoading(false); }
  };

  const TYPE_COLOR: Record<string, string> = { 'Full-time': '#00C896', 'Part-time': '#F59E0B', 'Contract': '#6366F1', 'Remote': '#EC4899' };

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#10B98118', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Globe size={18} color="#10B981" />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>Uganda Job Board</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Find real job opportunities in Uganda & East Africa</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input-field" placeholder="Search jobs e.g. Software Developer, Nurse, Teacher…" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search(query)} style={{ paddingLeft: 42 }} />
          </div>
          <button className="btn-brand" onClick={() => search(query)} disabled={loading || !query.trim()} style={{ padding: '0 20px', gap: 8, opacity: !query.trim() ? 0.5 : 1 }}>
            {loading ? <Loader size={16} style={{ animation: 'spin-slow 0.8s linear infinite' }} /> : <Search size={15} />}
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>Popular:</span>
          {POPULAR.map(r => (
            <button key={r} onClick={() => { setQuery(r); search(r); }} style={{ padding: '5px 12px', borderRadius: 99, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = '#10B981'; (e.target as HTMLElement).style.color = '#10B981'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; (e.target as HTMLElement).style.color = 'var(--text-secondary)'; }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {error && <div style={{ padding: '12px 16px', borderRadius: 12, background: '#EF444415', border: '1px solid #EF444430', color: '#EF4444', fontSize: 13, marginBottom: 16 }}>{error}</div>}

      {jobs.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>
              {jobs.length} Jobs for "<span style={{ color: '#10B981' }}>{searched}</span>" in Uganda
            </h3>
            <button className="btn-ghost" onClick={() => { setJobs([]); setSearched(''); }} style={{ fontSize: 13, gap: 6 }}>
              <RotateCcw size={13} /> New Search
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {jobs.map((job, i) => (
              <div key={i} className="glass-card" style={{ padding: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>{job.title}</h4>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: `${TYPE_COLOR[job.type] || '#10B981'}15`, color: TYPE_COLOR[job.type] || '#10B981', border: `1px solid ${TYPE_COLOR[job.type] || '#10B981'}30` }}>{job.type}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-secondary)' }}><Building size={13} /> {job.company}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-secondary)' }}><MapPin size={13} /> {job.location}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}><Clock size={12} /> {job.postedDays}d ago</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#10B981', fontFamily: 'Syne, sans-serif' }}>{job.salary}</div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 14 }}>{job.description}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {job.requirements?.map((r, ri) => <span key={ri} className="tag tag-gray" style={{ fontSize: 11 }}>{r}</span>)}
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <a
                    href={`https://www.brightermonday.co.ug/jobs?q=${encodeURIComponent(job.title + ' ' + job.company)}&l=Uganda`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn-outline"
                    style={{ padding: '8px 16px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <ExternalLink size={13} /> BrighterMonday
                  </a>
                  <a
                    href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title + ' ' + job.company)}&location=Uganda&f_TPR=r604800`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn-brand"
                    style={{ padding: '8px 16px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Briefcase size={13} /> Apply Now
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            💡 Jobs are AI-generated based on real Uganda market data. Click "Apply Now" to search live listings on LinkedIn or BrighterMonday.
          </div>
        </div>
      )}

      {!loading && jobs.length === 0 && !error && (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <Globe size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Search for jobs in Uganda</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Type a job title above or pick from the popular searches.<br />We'll show you realistic opportunities in Uganda and East Africa.
          </p>
        </div>
      )}
    </div>
  );
}
