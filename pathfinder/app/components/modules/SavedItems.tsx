'use client';
import { useState, useEffect } from 'react';
import { Bookmark, Trash2, Briefcase, Map, Mic, ChevronDown, ChevronUp, Clock, BookmarkX } from 'lucide-react';

export interface SavedItem {
  id: string; type: 'career' | 'roadmap' | 'interview'; title: string;
  savedAt: string; data: unknown;
}

const STORAGE_KEY = 'pathfinder-saved';
const TYPE_META = {
  career:    { label: 'Career Match',    icon: Briefcase, color: '#F59E0B' },
  roadmap:   { label: 'Skill Roadmap',   icon: Map,       color: '#6366F1' },
  interview: { label: 'Interview Prep',  icon: Mic,       color: '#EC4899' },
};

export function saveItem(item: Omit<SavedItem, 'id' | 'savedAt'>) {
  const existing: SavedItem[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const newItem: SavedItem = { ...item, id: crypto.randomUUID(), savedAt: new Date().toLocaleString('en-UG') };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...existing]));
}

export default function SavedItems() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'career' | 'roadmap' | 'interview'>('all');

  useEffect(() => {
    const load = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      setItems(saved ? JSON.parse(saved) : []);
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const deleteItem = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearAll = () => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#06B6D418', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bookmark size={18} color="#06B6D4" />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>Saved Items</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Your saved career matches, roadmaps and interview sets</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'career', 'roadmap', 'interview'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 14px', borderRadius: 99, border: `2px solid ${filter === f ? '#06B6D4' : 'var(--border)'}`, background: filter === f ? '#06B6D418' : 'var(--bg-input)', color: filter === f ? '#06B6D4' : 'var(--text-secondary)', fontSize: 13, fontWeight: filter === f ? 700 : 400, cursor: 'pointer', transition: 'all 0.2s ease', textTransform: 'capitalize' }}>
              {f === 'all' ? `All (${items.length})` : `${TYPE_META[f].label} (${items.filter(i => i.type === f).length})`}
            </button>
          ))}
        </div>
        {items.length > 0 && (
          <button onClick={clearAll} className="btn-ghost" style={{ fontSize: 12, color: '#EF4444', gap: 5 }}>
            <Trash2 size={12} /> Clear All
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
          <BookmarkX size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Nothing saved yet</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            When you get career matches, roadmaps or interview sets,<br />hit the <strong>Save</strong> button to find them here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(item => {
            const meta = TYPE_META[item.type];
            const Icon = meta.icon;
            const isOpen = expanded === item.id;
            return (
              <div key={item.id} className="glass-card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${meta.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={meta.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                      <span className="tag" style={{ fontSize: 10, padding: '2px 8px', background: `${meta.color}15`, color: meta.color, borderRadius: 99, border: `1px solid ${meta.color}30` }}>{meta.label}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} /> {item.savedAt}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setExpanded(isOpen ? null : item.id)} className="btn-ghost" style={{ padding: '6px 10px', fontSize: 12, gap: 4 }}>
                      {isOpen ? <><ChevronUp size={13} /> Hide</> : <><ChevronDown size={13} /> View</>}
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="btn-ghost" style={{ padding: '6px 8px', color: '#EF4444' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {isOpen && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
                    <pre style={{ marginTop: 16, fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: 16, borderRadius: 10, overflow: 'auto', maxHeight: 300, whiteSpace: 'pre-wrap', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.7 }}>
                      {JSON.stringify(item.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
