'use client';
import { useState } from 'react';
import { FileText, Plus, Trash2, Download, Loader, ChevronRight, ChevronLeft, CheckCircle, User, Briefcase, GraduationCap, Star, Eye } from 'lucide-react';

interface Experience { company: string; role: string; duration: string; description: string; }
interface Education { school: string; degree: string; year: string; grade: string; }
interface CVData {
  fullName: string; email: string; phone: string; location: string; summary: string;
  experiences: Experience[]; education: Education[];
  skills: string[]; languages: string[]; newSkill: string; newLang: string;
}

const STEPS = [
  { id: 1, label: 'Personal Info', icon: User },
  { id: 2, label: 'Experience', icon: Briefcase },
  { id: 3, label: 'Education', icon: GraduationCap },
  { id: 4, label: 'Skills', icon: Star },
  { id: 5, label: 'Preview & Download', icon: Eye },
];

export default function CVBuilder() {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState(false);
  const [cv, setCv] = useState<CVData>({
    fullName: '', email: '', phone: '', location: '', summary: '',
    experiences: [{ company: '', role: '', duration: '', description: '' }],
    education: [{ school: '', degree: '', year: '', grade: '' }],
    skills: [], languages: ['English'], newSkill: '', newLang: '',
  });

  const update = (field: keyof CVData, value: unknown) => setCv(prev => ({ ...prev, [field]: value }));

  const updateExp = (i: number, field: keyof Experience, value: string) => {
    const exps = [...cv.experiences];
    exps[i] = { ...exps[i], [field]: value };
    update('experiences', exps);
  };

  const updateEdu = (i: number, field: keyof Education, value: string) => {
    const edu = [...cv.education];
    edu[i] = { ...edu[i], [field]: value };
    update('education', edu);
  };

  const addSkill = () => {
    if (!cv.newSkill.trim()) return;
    update('skills', [...cv.skills, cv.newSkill.trim()]);
    update('newSkill', '');
  };

  const addLang = () => {
    if (!cv.newLang.trim()) return;
    update('languages', [...cv.languages, cv.newLang.trim()]);
    update('newLang', '');
  };

  const generateSummary = async () => {
    setAiSummary(true);
    try {
      const prompt = `Write a professional 3-sentence CV summary for ${cv.fullName || 'a candidate'} based on:
Role/Experience: ${cv.experiences.map(e => e.role).filter(Boolean).join(', ') || 'entry level'}
Education: ${cv.education.map(e => e.degree).filter(Boolean).join(', ') || 'university student'}
Skills: ${cv.skills.join(', ') || 'various skills'}
Location: ${cv.location || 'Uganda'}

Write it in first person, professional, and tailored for the Ugandan job market. Return only the summary text, nothing else.`;
      const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
      const data = await res.json();
      update('summary', data.content.trim());
    } catch { /* silent */ } finally { setAiSummary(false); }
  };

  const downloadCV = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 600));

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Arial', sans-serif; color: #1a1a1a; background: #fff; }
  .page { max-width: 800px; margin: 0 auto; padding: 48px; }
  .header { border-bottom: 3px solid #00C896; padding-bottom: 24px; margin-bottom: 28px; }
  .name { font-size: 32px; font-weight: 800; color: #0a0a0a; letter-spacing: -0.5px; }
  .contact { display: flex; gap: 20px; margin-top: 8px; font-size: 13px; color: #555; flex-wrap: wrap; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #00C896; margin-bottom: 14px; padding-bottom: 6px; border-bottom: 1px solid #eee; }
  .summary { font-size: 14px; line-height: 1.7; color: #444; }
  .exp-item { margin-bottom: 18px; }
  .exp-header { display: flex; justify-content: space-between; align-items: flex-start; }
  .exp-role { font-size: 15px; font-weight: 700; color: #0a0a0a; }
  .exp-company { font-size: 14px; color: #00C896; font-weight: 600; }
  .exp-duration { font-size: 13px; color: #888; }
  .exp-desc { font-size: 13px; color: #555; line-height: 1.6; margin-top: 6px; }
  .edu-item { display: flex; justify-content: space-between; margin-bottom: 12px; }
  .edu-degree { font-size: 14px; font-weight: 700; }
  .edu-school { font-size: 13px; color: #555; }
  .edu-year { font-size: 13px; color: #888; }
  .skills-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .skill-tag { padding: 5px 14px; border-radius: 99px; background: #f0fdf9; color: #00a87e; font-size: 12px; font-weight: 600; border: 1px solid #c6f0e5; }
  .lang-tag { padding: 5px 14px; border-radius: 99px; background: #f5f5f5; color: #555; font-size: 12px; font-weight: 600; }
  @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
</style></head>
<body><div class="page">
  <div class="header">
    <div class="name">${cv.fullName || 'Your Name'}</div>
    <div class="contact">
      ${cv.email ? `<span>✉ ${cv.email}</span>` : ''}
      ${cv.phone ? `<span>📞 ${cv.phone}</span>` : ''}
      ${cv.location ? `<span>📍 ${cv.location}</span>` : ''}
    </div>
  </div>
  ${cv.summary ? `<div class="section"><div class="section-title">Professional Summary</div><div class="summary">${cv.summary}</div></div>` : ''}
  ${cv.experiences.some(e => e.role) ? `
  <div class="section"><div class="section-title">Work Experience</div>
    ${cv.experiences.filter(e => e.role).map(e => `
    <div class="exp-item">
      <div class="exp-header">
        <div><div class="exp-role">${e.role}</div><div class="exp-company">${e.company}</div></div>
        <div class="exp-duration">${e.duration}</div>
      </div>
      ${e.description ? `<div class="exp-desc">${e.description}</div>` : ''}
    </div>`).join('')}
  </div>` : ''}
  ${cv.education.some(e => e.school) ? `
  <div class="section"><div class="section-title">Education</div>
    ${cv.education.filter(e => e.school).map(e => `
    <div class="edu-item">
      <div><div class="edu-degree">${e.degree}</div><div class="edu-school">${e.school}</div></div>
      <div style="text-align:right"><div class="edu-year">${e.year}</div>${e.grade ? `<div style="font-size:12px;color:#888">${e.grade}</div>` : ''}</div>
    </div>`).join('')}
  </div>` : ''}
  ${cv.skills.length > 0 ? `
  <div class="section"><div class="section-title">Skills</div>
    <div class="skills-grid">${cv.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
  </div>` : ''}
  ${cv.languages.length > 0 ? `
  <div class="section"><div class="section-title">Languages</div>
    <div class="skills-grid">${cv.languages.map(l => `<span class="lang-tag">${l}</span>`).join('')}</div>
  </div>` : ''}
</div></body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${(cv.fullName || 'CV').replace(/\s+/g, '_')}_CV.html`;
    a.click(); URL.revokeObjectURL(url);
    setGenerating(false);
  };

  // InputField is defined outside the component (see bottom of file) to prevent re-mount on every keystroke

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#8B5CF618', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileText size={18} color="#8B5CF6" />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>CV Builder</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Build a professional CV in minutes with AI assistance</p>
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = step === s.id;
          const done = step > s.id;
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
              <button onClick={() => done && setStep(s.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: done ? 'pointer' : 'default', padding: '0 8px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: done ? 'var(--brand)' : active ? 'var(--brand-subtle)' : 'var(--bg-elevated)', border: `2px solid ${done || active ? 'var(--brand)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>
                  {done ? <CheckCircle size={16} color="#000" /> : <Icon size={15} color={active ? 'var(--brand)' : 'var(--text-muted)'} />}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: active ? 'var(--brand)' : done ? 'var(--text-secondary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <div style={{ width: 32, height: 2, background: step > s.id ? 'var(--brand)' : 'var(--border)', borderRadius: 99, flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>

      <div className="glass-card" style={{ padding: 28 }}>
        {/* Step 1 — Personal Info */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif', marginBottom: 20 }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <InputField label="Full Name *" value={cv.fullName} onChange={v => update('fullName', v)} placeholder="Veronica Mirembe" />
              <InputField label="Email *" value={cv.email} onChange={v => update('email', v)} placeholder="you@email.com" type="email" />
              <InputField label="Phone" value={cv.phone} onChange={v => update('phone', v)} placeholder="+256 7XX XXX XXX" />
              <InputField label="Location" value={cv.location} onChange={v => update('location', v)} placeholder="Kampala, Uganda" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Professional Summary</label>
                <button onClick={generateSummary} disabled={aiSummary} style={{ background: 'none', border: '1px solid var(--brand)', borderRadius: 8, padding: '4px 10px', color: 'var(--brand)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {aiSummary ? <Loader size={11} style={{ animation: 'spin-slow 0.8s linear infinite' }} /> : '✨'} AI Generate
                </button>
              </div>
              <textarea className="input-field" rows={4} placeholder="Write 2-3 sentences about yourself, your experience and career goals…" value={cv.summary} onChange={e => update('summary', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
          </div>
        )}

        {/* Step 2 — Experience */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>Work Experience</h3>
              <button onClick={() => update('experiences', [...cv.experiences, { company: '', role: '', duration: '', description: '' }])} className="btn-outline" style={{ padding: '6px 12px', fontSize: 13 }}>
                <Plus size={13} /> Add More
              </button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>No experience yet? Add internships, volunteer work, or school projects.</p>
            {cv.experiences.map((exp, i) => (
              <div key={i} style={{ padding: 20, borderRadius: 14, background: 'var(--bg-elevated)', marginBottom: 14, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>Experience #{i + 1}</span>
                  {cv.experiences.length > 1 && <button onClick={() => update('experiences', cv.experiences.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={14} /></button>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                  <InputField label="Job Title" value={exp.role} onChange={v => updateExp(i, 'role', v)} placeholder="Software Developer" />
                  <InputField label="Company/Organisation" value={exp.company} onChange={v => updateExp(i, 'company', v)} placeholder="MTN Uganda" />
                  <InputField label="Duration" value={exp.duration} onChange={v => updateExp(i, 'duration', v)} placeholder="Jan 2023 – Present" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>What did you do?</label>
                  <textarea className="input-field" rows={3} placeholder="Describe your key responsibilities and achievements…" value={exp.description} onChange={e => updateExp(i, 'description', e.target.value)} style={{ resize: 'vertical' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3 — Education */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>Education</h3>
              <button onClick={() => update('education', [...cv.education, { school: '', degree: '', year: '', grade: '' }])} className="btn-outline" style={{ padding: '6px 12px', fontSize: 13 }}>
                <Plus size={13} /> Add More
              </button>
            </div>
            {cv.education.map((edu, i) => (
              <div key={i} style={{ padding: 20, borderRadius: 14, background: 'var(--bg-elevated)', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>Education #{i + 1}</span>
                  {cv.education.length > 1 && <button onClick={() => update('education', cv.education.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={14} /></button>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                  <InputField label="School / University" value={edu.school} onChange={v => updateEdu(i, 'school', v)} placeholder="Makerere University" />
                  <InputField label="Degree / Certificate" value={edu.degree} onChange={v => updateEdu(i, 'degree', v)} placeholder="BSc Computer Science" />
                  <InputField label="Year" value={edu.year} onChange={v => updateEdu(i, 'year', v)} placeholder="2020 – 2024" />
                  <InputField label="Grade / Result" value={edu.grade} onChange={v => updateEdu(i, 'grade', v)} placeholder="Upper Second Class / 4.0 GPA" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4 — Skills */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif', marginBottom: 20 }}>Skills & Languages</h3>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Technical & Soft Skills</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input className="input-field" placeholder="e.g. Python, Leadership, Microsoft Excel…" value={cv.newSkill} onChange={e => update('newSkill', e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} style={{ flex: 1 }} />
                <button className="btn-brand" onClick={addSkill} style={{ padding: '0 16px' }}><Plus size={16} /></button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {cv.skills.map(s => (
                  <span key={s} onClick={() => update('skills', cv.skills.filter(x => x !== s))} className="tag tag-brand" style={{ cursor: 'pointer', gap: 6 }}>
                    {s} <span style={{ fontSize: 14, lineHeight: 1 }}>×</span>
                  </span>
                ))}
                {cv.skills.length === 0 && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No skills added yet — type one above and press Enter</span>}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Languages</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input className="input-field" placeholder="e.g. Luganda, Swahili, French…" value={cv.newLang} onChange={e => update('newLang', e.target.value)} onKeyDown={e => e.key === 'Enter' && addLang()} style={{ flex: 1 }} />
                <button className="btn-brand" onClick={addLang} style={{ padding: '0 16px' }}><Plus size={16} /></button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {cv.languages.map(l => (
                  <span key={l} onClick={() => l !== 'English' && update('languages', cv.languages.filter(x => x !== l))} className="tag tag-gray" style={{ cursor: l !== 'English' ? 'pointer' : 'default' }}>
                    {l} {l !== 'English' && '×'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5 — Preview */}
        {step === 5 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>Your CV is Ready!</h3>
              <button className="btn-brand" onClick={downloadCV} disabled={generating} style={{ gap: 8 }}>
                {generating ? <Loader size={15} style={{ animation: 'spin-slow 0.8s linear infinite' }} /> : <Download size={15} />}
                {generating ? 'Generating…' : 'Download CV'}
              </button>
            </div>
            {/* Preview card */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 28, background: 'var(--bg-card)', fontFamily: 'Arial, sans-serif' }}>
              <div style={{ borderBottom: '3px solid var(--brand)', paddingBottom: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{cv.fullName || 'Your Name'}</div>
                <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  {cv.email && <span>✉ {cv.email}</span>}
                  {cv.phone && <span>📞 {cv.phone}</span>}
                  {cv.location && <span>📍 {cv.location}</span>}
                </div>
              </div>
              {cv.summary && <div style={{ marginBottom: 16 }}><div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--brand)', marginBottom: 8 }}>Professional Summary</div><p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{cv.summary}</p></div>}
              {cv.experiences.some(e => e.role) && <div style={{ marginBottom: 16 }}><div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--brand)', marginBottom: 8 }}>Experience</div>{cv.experiences.filter(e => e.role).map((e, i) => <div key={i} style={{ marginBottom: 10 }}><div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{e.role} — <span style={{ color: 'var(--brand)' }}>{e.company}</span></div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.duration}</div>{e.description && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.6 }}>{e.description}</div>}</div>)}</div>}
              {cv.skills.length > 0 && <div><div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--brand)', marginBottom: 8 }}>Skills</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{cv.skills.map(s => <span key={s} className="tag tag-brand" style={{ fontSize: 11 }}>{s}</span>)}</div></div>}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, textAlign: 'center' }}>💡 Open the downloaded file in your browser then press Ctrl+P to save as PDF</p>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <button className="btn-outline" onClick={() => setStep(s => s - 1)} disabled={step === 1} style={{ padding: '10px 20px', opacity: step === 1 ? 0.3 : 1 }}>
            <ChevronLeft size={15} /> Back
          </button>
          {step < 5 && (
            <button className="btn-brand" onClick={() => setStep(s => s + 1)} style={{ padding: '10px 20px' }}>
              Next <ChevronRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Defined OUTSIDE CVBuilder so React never unmounts it on re-render ──
// This is the fix for the "one character at a time" input focus bug.
// When a component is defined inside another component, React treats it as
// a new component type on every render and unmounts+remounts it — losing focus.
function InputField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>
        {label}
      </label>
      <input
        className="input-field"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
