'use client';
import { useState } from 'react';
import { AppView } from '../page';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import OnboardingTour from './OnboardingTour';
import CareerRecommender from './modules/CareerRecommender';
import SkillRoadmap from './modules/SkillRoadmap';
import InterviewPrep from './modules/InterviewPrep';
import StudyPlan from './modules/StudyPlan';
import ChatBot from './modules/ChatBot';
import CVBuilder from './modules/CVBuilder';
import ProgressTracker from './modules/ProgressTracker';
import SavedItems from './modules/SavedItems';
import JobBoard from './modules/JobBoard';
import {
  Compass, Zap, Map, Mic, BookOpen, LogOut, ChevronRight,
  Sparkles, LayoutDashboard, Bot, FileText, Trophy, Bookmark, Globe,
} from 'lucide-react';

interface Props { onNavigate: (v: AppView) => void; }
type Module = 'home' | 'career' | 'roadmap' | 'interview' | 'study' | 'chat' | 'cv' | 'progress' | 'saved' | 'jobs';

const CORE_MODULES = [
  { id: 'career'   as Module, icon: Zap,      label: 'Career Match',    color: '#F59E0B', desc: 'Find your perfect career' },
  { id: 'roadmap'  as Module, icon: Map,      label: 'Skill Roadmap',   color: '#6366F1', desc: 'Build your skills' },
  { id: 'interview'as Module, icon: Mic,      label: 'Interview Prep',  color: '#EC4899', desc: 'Practice & get ready' },
  { id: 'study'    as Module, icon: BookOpen, label: 'Study Plan',      color: '#00C896', desc: 'Structured learning' },
];

const TOOL_MODULES = [
  { id: 'chat'    as Module, icon: Bot,      label: 'AI Assistant',    color: '#00C896',  desc: 'Ask me anything' },
  { id: 'cv'      as Module, icon: FileText, label: 'CV Builder',      color: '#8B5CF6',  desc: 'Build your CV' },
  { id: 'progress'as Module, icon: Trophy,   label: 'Progress',        color: '#F59E0B',  desc: 'Track your skills' },
  { id: 'saved'   as Module, icon: Bookmark, label: 'Saved',           color: '#06B6D4',  desc: 'Your saved items' },
  { id: 'jobs'    as Module, icon: Globe,    label: 'Job Board',       color: '#10B981',  desc: 'Jobs in Uganda' },
];

const ALL_MODULES = [...CORE_MODULES, ...TOOL_MODULES];

export default function Dashboard({ onNavigate }: Props) {
  const { user, signOut } = useAuth();
  const [active, setActive] = useState<Module>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSignOut = () => { signOut(); onNavigate('landing'); };
  const firstName = user?.name?.split(' ')[0] || 'there';
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const currentMod = ALL_MODULES.find(m => m.id === active);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <OnboardingTour />

      {/* Sidebar */}
      <aside style={{ width: sidebarOpen ? 240 : 64, flexShrink: 0, background: 'var(--bg-card)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1)', overflow: 'hidden', position: 'sticky', top: 0, height: '100vh', zIndex: 40 }}>
        {/* Logo */}
        <div style={{ padding: '18px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Compass size={17} color="#000" strokeWidth={2.5} />
          </div>
          {sidebarOpen && <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Pathfinder</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          <button className={`sidebar-item ${active === 'home' ? 'active' : ''}`} onClick={() => setActive('home')} title="Dashboard">
            <LayoutDashboard size={16} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          {sidebarOpen && <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 4px 4px', marginTop: 4 }}>AI Modules</p>}
          {!sidebarOpen && <div style={{ height: 8 }} />}

          {CORE_MODULES.map(({ id, icon: Icon, label, color }) => (
            <button key={id} className={`sidebar-item ${active === id ? 'active' : ''}`} onClick={() => setActive(id)} title={label}>
              <Icon size={16} color={active === id ? color : undefined} style={{ flexShrink: 0 }} />
              {sidebarOpen && <><span style={{ flex: 1 }}>{label}</span>{active === id && <ChevronRight size={12} style={{ color }} />}</>}
            </button>
          ))}

          {sidebarOpen && <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 4px 4px', marginTop: 4 }}>Tools</p>}
          {!sidebarOpen && <div style={{ height: 4 }} />}

          {TOOL_MODULES.map(({ id, icon: Icon, label, color }) => (
            <button key={id} className={`sidebar-item ${active === id ? 'active' : ''}`} onClick={() => setActive(id)} title={label}>
              <Icon size={16} color={active === id ? color : undefined} style={{ flexShrink: 0 }} />
              {sidebarOpen && <><span style={{ flex: 1 }}>{label}</span>{active === id && <ChevronRight size={12} style={{ color }} />}</>}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 8px', borderRadius: 12, background: 'var(--bg-elevated)' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand), #4DFFD2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 11, color: '#000', flexShrink: 0 }}>{initials}</div>
            {sidebarOpen && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                </div>
                <button className="btn-ghost" onClick={handleSignOut} style={{ padding: 5, flexShrink: 0 }} title="Sign out">
                  <LogOut size={13} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, maxHeight: '100vh', overflow: 'auto' }}>
        {/* Topbar */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>
              {active === 'home' ? `Hey ${firstName} 👋` : currentMod?.label}
            </h2>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {active === 'home' ? 'What would you like to explore today?' : currentMod?.desc}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user?.interests?.slice(0, 2).map(i => (
              <span key={i} className="tag tag-brand" style={{ fontSize: 10, padding: '2px 8px' }}>{i.split(' ').slice(1).join(' ') || i}</span>
            ))}
            <ThemeToggle />
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand), #4DFFD2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 11, color: '#000', cursor: 'pointer' }}>{initials}</div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px', maxWidth: 980, margin: '0 auto', width: '100%' }}>
          {active === 'home'     && <HomeView firstName={firstName} onSelectModule={setActive} userInterests={user?.interests} />}
          {active === 'career'   && <CareerRecommender />}
          {active === 'roadmap'  && <SkillRoadmap />}
          {active === 'interview'&& <InterviewPrep />}
          {active === 'study'    && <StudyPlan />}
          {active === 'chat'     && <ChatBot />}
          {active === 'cv'       && <CVBuilder />}
          {active === 'progress' && <ProgressTracker />}
          {active === 'saved'    && <SavedItems />}
          {active === 'jobs'     && <JobBoard />}
        </div>
      </main>
    </div>
  );
}

function HomeView({ firstName, onSelectModule, userInterests }: { firstName: string; onSelectModule: (m: Module) => void; userInterests?: string[] }) {
  return (
    <div className="animate-fade-up">
      {/* Welcome banner */}
      <div style={{ background: 'linear-gradient(135deg, #0D1F1A 0%, #0A2A1A 100%)', borderRadius: 20, padding: '28px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,200,150,0.15) 0%, transparent 70%)' }} />
        <Sparkles size={22} color="var(--brand)" style={{ marginBottom: 10 }} />
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.03em' }}>
          Welcome back, <span style={{ color: 'var(--brand)' }}>{firstName}</span>! 🎉
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6, maxWidth: 480, marginBottom: userInterests?.length ? 14 : 0 }}>
          Your AI career toolkit is ready. Use the modules below to discover career paths, build skills, prep for interviews, and find jobs in Uganda.
        </p>
        {userInterests && userInterests.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {userInterests.map(i => <span key={i} style={{ background: 'rgba(0,200,150,0.15)', border: '1px solid rgba(0,200,150,0.3)', borderRadius: 99, padding: '3px 10px', fontSize: 11, color: 'var(--brand)', fontWeight: 600 }}>{i}</span>)}
          </div>
        )}
      </div>

      {/* Core modules */}
      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>AI Modules</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        {CORE_MODULES.map(({ id, icon: Icon, label, color, desc }) => (
          <button key={id} className="glass-card feature-card" onClick={() => onSelectModule(id)} style={{ padding: 20, cursor: 'pointer', border: 'none', textAlign: 'left', width: '100%' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Icon size={18} color={color} />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, fontFamily: 'Syne, sans-serif' }}>{label}</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>{desc}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color }}>Open <ChevronRight size={12} /></div>
          </button>
        ))}
      </div>

      {/* Tool modules */}
      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Tools</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {TOOL_MODULES.map(({ id, icon: Icon, label, color, desc }) => (
          <button key={id} className="glass-card feature-card" onClick={() => onSelectModule(id)} style={{ padding: 18, cursor: 'pointer', border: 'none', textAlign: 'left', width: '100%' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Icon size={16} color={color} />
            </div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3, fontFamily: 'Syne, sans-serif' }}>{label}</h3>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</p>
          </button>
        ))}
      </div>

      {/* Tips */}
      <div className="glass-card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, fontFamily: 'Syne, sans-serif' }}>💡 Pro Tips</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {[
            { tip: 'Start with Career Match', detail: 'Let AI find your best-fit careers based on your interests.' },
            { tip: 'Build Your CV', detail: 'Use the CV Builder before applying — AI writes your summary.' },
            { tip: 'Track Progress', detail: 'Mark skills as done to see how close you are to job-ready.' },
            { tip: 'Ask the AI', detail: 'The AI Assistant can answer any career question 24/7.' },
          ].map(({ tip, detail }) => (
            <div key={tip} style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-elevated)', borderLeft: '3px solid var(--brand)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{tip}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
