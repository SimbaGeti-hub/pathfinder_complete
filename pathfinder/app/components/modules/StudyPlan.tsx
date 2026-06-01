'use client';
import { useState } from 'react';
import { BookOpen, Send, Loader, RotateCcw, Clock, Calendar, CheckCircle, Target } from 'lucide-react';

interface DayPlan { day: string; tasks: string[]; duration: string; }
interface WeekPlan { week: number; theme: string; days: DayPlan[]; goal: string; }
interface StudyPlanData { subject: string; duration: string; hoursPerDay: string; weeklyPlans: WeekPlan[]; motivation: string; }

const SUBJECTS = ['Python Programming', 'Web Development', 'Data Science', 'Digital Marketing', 'Accounting & Finance', 'UI/UX Design', 'English Communication', 'Mathematics', 'Business Management', 'Graphic Design'];
const HOURS = ['1 hour/day', '2 hours/day', '3 hours/day', '4+ hours/day'];
const DURATIONS = ['2 weeks', '1 month', '3 months', '6 months'];
const WEEK_COLORS = ['#6366F1', '#F59E0B', '#EC4899', '#00C896'];

export default function StudyPlan() {
  const [subject, setSubject] = useState('');
  const [hours, setHours] = useState(HOURS[1]);
  const [duration, setDuration] = useState(DURATIONS[1]);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlanData | null>(null);
  const [error, setError] = useState('');
  const [activeWeek, setActiveWeek] = useState(0);

  const handleSubmit = async () => {
    if (!subject.trim()) { setError('Please enter or select a subject.'); return; }
    setError(''); setLoading(true); setPlan(null);

    try {
      const prompt = `You are an expert study coach for students in Uganda.

Create a structured study plan for: ${subject}
Time available: ${hours}
Duration: ${duration}

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "subject": "${subject}",
  "duration": "${duration}",
  "hoursPerDay": "${hours}",
  "weeklyPlans": [
    {
      "week": 1,
      "theme": "Week theme title",
      "goal": "What you will achieve this week",
      "days": [
        { "day": "Monday", "tasks": ["Task 1", "Task 2"], "duration": "2 hrs" },
        { "day": "Tuesday", "tasks": ["Task 1"], "duration": "2 hrs" },
        { "day": "Wednesday", "tasks": ["Task 1", "Task 2"], "duration": "2 hrs" },
        { "day": "Thursday", "tasks": ["Task 1"], "duration": "2 hrs" },
        { "day": "Friday", "tasks": ["Task 1", "Task 2"], "duration": "2 hrs" },
        { "day": "Saturday", "tasks": ["Review & Practice"], "duration": "1 hr" },
        { "day": "Sunday", "tasks": ["Rest & Reflect"], "duration": "30 min" }
      ]
    }
  ],
  "motivation": "An inspiring one-sentence motivational message personalized to this subject"
}

Include 2 weeks of plans (regardless of duration, show first 2 weeks in detail). Make tasks specific and actionable.`;

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, system: 'Return only valid JSON, no markdown, no explanation.' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API error');

      const jsonMatch = data.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse study plan');
      setPlan(JSON.parse(jsonMatch[0]));
      setActiveWeek(0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally { setLoading(false); }
  };

  const reset = () => { setPlan(null); setSubject(''); setActiveWeek(0); };

  const DAY_COLORS: Record<string, string> = { Monday: '#6366F1', Tuesday: '#F59E0B', Wednesday: '#EC4899', Thursday: '#00C896', Friday: '#8B5CF6', Saturday: '#06B6D4', Sunday: '#94A3B8' };

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#00C89618', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BookOpen size={18} color="#00C896" />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>Study Plan Generator</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Get a structured weekly study schedule tailored to your goals</p>
        </div>
      </div>

      {!plan ? (
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>What do you want to study?</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {SUBJECTS.map(s => (
              <button key={s} onClick={() => setSubject(s)} style={{ padding: '7px 14px', borderRadius: 99, border: `2px solid ${subject === s ? '#00C896' : 'var(--border)'}`, background: subject === s ? '#00C89618' : 'var(--bg-input)', color: subject === s ? '#00C896' : 'var(--text-secondary)', fontSize: 13, fontWeight: subject === s ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                {s}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Or type your subject</label>
            <input className="input-field" placeholder="e.g. IELTS Preparation, Photography…" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Hours per day</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {HOURS.map(h => (
                  <button key={h} onClick={() => setHours(h)} style={{ padding: '8px 14px', borderRadius: 10, border: `2px solid ${hours === h ? '#00C896' : 'var(--border)'}`, background: hours === h ? '#00C89618' : 'var(--bg-input)', color: hours === h ? '#00C896' : 'var(--text-secondary)', fontSize: 13, fontWeight: hours === h ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left' }}>
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Duration</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {DURATIONS.map(d => (
                  <button key={d} onClick={() => setDuration(d)} style={{ padding: '8px 14px', borderRadius: 10, border: `2px solid ${duration === d ? '#00C896' : 'var(--border)'}`, background: duration === d ? '#00C89618' : 'var(--bg-input)', color: duration === d ? '#00C896' : 'var(--text-secondary)', fontSize: 13, fontWeight: duration === d ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: '#EF444418', border: '1px solid #EF444440', color: '#EF4444', fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <button className="btn-brand" onClick={handleSubmit} disabled={loading} style={{ justifyContent: 'center', width: '100%', padding: '14px', fontSize: 15, borderRadius: 13 }}>
            {loading ? <><Loader size={16} style={{ animation: 'spin-slow 0.8s linear infinite' }} /> Creating your plan…</> : <><Send size={15} /> Generate Study Plan</>}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)', marginBottom: 6 }}>{plan.subject} Study Plan</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-muted)' }}><Calendar size={13} /> {plan.duration}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-muted)' }}><Clock size={13} /> {plan.hoursPerDay}</div>
              </div>
            </div>
            <button className="btn-outline" onClick={reset} style={{ padding: '8px 14px', fontSize: 13 }}>
              <RotateCcw size={13} /> New Plan
            </button>
          </div>

          {/* Motivation banner */}
          {plan.motivation && (
            <div style={{ background: 'linear-gradient(135deg, #0D1F1A, #0A2A1A)', borderRadius: 16, padding: '18px 22px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Target size={20} color="var(--brand)" style={{ flexShrink: 0 }} />
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.6, fontStyle: 'italic' }}>"{plan.motivation}"</p>
            </div>
          )}

          {/* Week tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
            {plan.weeklyPlans?.map((w, i) => (
              <button key={i} onClick={() => setActiveWeek(i)} style={{ padding: '8px 18px', borderRadius: 99, border: `2px solid ${activeWeek === i ? WEEK_COLORS[i % WEEK_COLORS.length] : 'var(--border)'}`, background: activeWeek === i ? `${WEEK_COLORS[i % WEEK_COLORS.length]}18` : 'var(--bg-input)', color: activeWeek === i ? WEEK_COLORS[i % WEEK_COLORS.length] : 'var(--text-secondary)', fontSize: 13, fontWeight: activeWeek === i ? 700 : 400, cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}>
                Week {w.week}
              </button>
            ))}
          </div>

          {plan.weeklyPlans?.[activeWeek] && (() => {
            const week = plan.weeklyPlans[activeWeek];
            const color = WEEK_COLORS[activeWeek % WEEK_COLORS.length];
            return (
              <div className="animate-fade-in">
                <div className="glass-card" style={{ padding: '18px 22px', marginBottom: 16, borderLeft: `4px solid ${color}` }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif', marginBottom: 4 }}>Week {week.week}: {week.theme}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={13} color={color} /> Goal: {week.goal}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {week.days?.map((day) => {
                    const dc = DAY_COLORS[day.day] || '#00C896';
                    const isWeekend = day.day === 'Saturday' || day.day === 'Sunday';
                    return (
                      <div key={day.day} className="glass-card" style={{ padding: 16, opacity: isWeekend ? 0.8 : 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: dc }}>{day.day}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 99 }}>{day.duration}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {day.tasks?.map((task, ti) => (
                            <div key={ti} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                              <div style={{ width: 5, height: 5, borderRadius: '50%', background: dc, marginTop: 5, flexShrink: 0 }} />
                              {task}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
