'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader, Bot, User, Trash2, Sparkles, Plus, MessageSquare, Pencil, Check, X, ChevronLeft, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Message { role: 'user' | 'assistant'; content: string; time: string; }
interface Conversation { id: string; name: string; messages: Message[]; createdAt: string; updatedAt: string; }

const STORAGE_KEY = 'pathfinder-chats';
const SUGGESTIONS = [
  'What career suits someone who loves tech and people?',
  'How do I write a CV with no experience?',
  'What skills do I need to become a data analyst?',
  'What jobs are in demand in Uganda right now?',
  'How do I prepare for my first job interview?',
  'What is the salary of a software developer in Uganda?',
];

function getTime() {
  return new Date().toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' });
}
function getDate() {
  return new Date().toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' });
}
function makeId() { return crypto.randomUUID(); }

// Auto-generate a chat name from the first user message
function generateChatName(firstMessage: string): string {
  const cleaned = firstMessage.trim().replace(/[?!.]/g, '');
  const words = cleaned.split(' ').slice(0, 5).join(' ');
  return words.length > 32 ? words.slice(0, 32) + '…' : words;
}

function loadChats(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveChats(chats: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

export default function ChatBot() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadChats();
    if (saved.length > 0) {
      setChats(saved);
      setActiveChatId(saved[0].id);
    } else {
      createNewChat(saved, false);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeChatId]);

  useEffect(() => {
    if (editingId) setTimeout(() => editRef.current?.focus(), 50);
  }, [editingId]);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  const createNewChat = useCallback((existing: Conversation[] = chats, persist = true) => {
    const firstName = user?.name?.split(' ')[0] || 'there';
    const id = makeId();
    const newChat: Conversation = {
      id,
      name: 'New Conversation',
      createdAt: getDate(),
      updatedAt: getDate(),
      messages: [{
        role: 'assistant',
        content: `Hey ${firstName}! 👋 I'm your Pathfinder AI assistant. Ask me anything about careers, skills, job hunting, CV writing, or education in Uganda. I'm here to help!`,
        time: getTime(),
      }],
    };
    const updated = [newChat, ...existing];
    if (persist) { setChats(updated); saveChats(updated); }
    else { setChats(updated); }
    setActiveChatId(id);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
    return id;
  }, [chats, user]);

  const updateChat = (id: string, messages: Message[], name?: string) => {
    setChats(prev => {
      const updated = prev.map(c => c.id === id
        ? { ...c, messages, updatedAt: getDate(), ...(name ? { name } : {}) }
        : c
      );
      saveChats(updated);
      return updated;
    });
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading || !activeChatId) return;
    const userMsg: Message = { role: 'user', content: text.trim(), time: getTime() };
    setInput('');
    setLoading(true);

    // Auto-name the chat from first user message
    const isFirstUserMessage = activeChat?.messages.every(m => m.role === 'assistant');
    const chatName = isFirstUserMessage ? generateChatName(text) : undefined;

    const currentMessages = activeChat?.messages || [];
    const withUser = [...currentMessages, userMsg];

    // Optimistically update UI
    setChats(prev => {
      const updated = prev.map(c => c.id === activeChatId
        ? { ...c, messages: withUser, updatedAt: getDate(), ...(chatName ? { name: chatName } : {}) }
        : c
      );
      saveChats(updated);
      return updated;
    });

    try {
      const history = withUser.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          userName: user?.name || 'Student',
          userInterests: user?.interests || [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const aiMsg: Message = { role: 'assistant', content: data.content, time: getTime() };
      updateChat(activeChatId, [...withUser, aiMsg]);
    } catch {
      const errMsg: Message = { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again.", time: getTime() };
      updateChat(activeChatId, [...withUser, errMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const deleteChat = (id: string) => {
    const updated = chats.filter(c => c.id !== id);
    setChats(updated);
    saveChats(updated);
    setDeleteConfirm(null);
    if (activeChatId === id) {
      if (updated.length > 0) setActiveChatId(updated[0].id);
      else createNewChat([], true);
    }
  };

  const startRename = (chat: Conversation) => {
    setEditingId(chat.id);
    setEditName(chat.name);
  };

  const saveRename = () => {
    if (!editingId || !editName.trim()) { setEditingId(null); return; }
    setChats(prev => {
      const updated = prev.map(c => c.id === editingId ? { ...c, name: editName.trim() } : c);
      saveChats(updated);
      return updated;
    });
    setEditingId(null);
  };

  // Group chats by date
  const todayChats = chats.filter(c => c.updatedAt === getDate());
  const olderChats = chats.filter(c => c.updatedAt !== getDate());

  return (
    <div className="animate-fade-up" style={{ display: 'flex', height: 'calc(100vh - 106px)', minHeight: 520, gap: 0, borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>

      {/* ── Chat History Sidebar ── */}
      <div style={{ width: sidebarOpen ? 240 : 0, flexShrink: 0, borderRight: sidebarOpen ? '1px solid var(--border)' : 'none', display: 'flex', flexDirection: 'column', transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1)', overflow: 'hidden', background: 'var(--bg-elevated)' }}>
        {/* Sidebar header */}
        <div style={{ padding: '14px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Chat History</span>
          <button onClick={() => createNewChat()} className="btn-brand" style={{ padding: '5px 10px', fontSize: 12, borderRadius: 8, gap: 4, whiteSpace: 'nowrap' }}>
            <Plus size={13} /> New
          </button>
        </div>

        {/* Chat list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {chats.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 12px', color: 'var(--text-muted)', fontSize: 12 }}>No conversations yet</div>
          )}

          {todayChats.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 8px 4px' }}>Today</div>
              {todayChats.map(chat => <ChatListItem key={chat.id} chat={chat} active={activeChatId === chat.id} editingId={editingId} editName={editName} editRef={editRef} deleteConfirm={deleteConfirm} onSelect={() => { setActiveChatId(chat.id); setDeleteConfirm(null); }} onStartRename={() => startRename(chat)} onSaveRename={saveRename} onEditName={setEditName} onCancelEdit={() => setEditingId(null)} onDeleteConfirm={() => setDeleteConfirm(chat.id)} onDelete={() => deleteChat(chat.id)} onCancelDelete={() => setDeleteConfirm(null)} />)}
            </>
          )}

          {olderChats.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 8px 4px' }}>Earlier</div>
              {olderChats.map(chat => <ChatListItem key={chat.id} chat={chat} active={activeChatId === chat.id} editingId={editingId} editName={editName} editRef={editRef} deleteConfirm={deleteConfirm} onSelect={() => { setActiveChatId(chat.id); setDeleteConfirm(null); }} onStartRename={() => startRename(chat)} onSaveRename={saveRename} onEditName={setEditName} onCancelEdit={() => setEditingId(null)} onDeleteConfirm={() => setDeleteConfirm(chat.id)} onDelete={() => deleteChat(chat.id)} onCancelDelete={() => setDeleteConfirm(null)} />)}
            </>
          )}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Chat topbar */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(s => !s)} className="btn-ghost" style={{ padding: 6 }} title={sidebarOpen ? 'Hide history' : 'Show history'}>
            <ChevronLeft size={16} style={{ transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s ease' }} />
          </button>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, var(--brand), #4DFFD2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bot size={16} color="#000" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeChat?.name || 'Pathfinder AI'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--brand)' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--brand)' }} />
              Online · Career Expert
            </div>
          </div>
          <button onClick={() => createNewChat()} className="btn-outline" style={{ padding: '6px 12px', fontSize: 12, gap: 5, flexShrink: 0 }}>
            <Plus size={13} /> New Chat
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeChat?.messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: msg.role === 'assistant' ? 'linear-gradient(135deg, var(--brand), #4DFFD2)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border)' }}>
                {msg.role === 'assistant' ? <Bot size={13} color="#000" /> : <User size={13} color="var(--text-muted)" />}
              </div>
              <div style={{ maxWidth: '75%' }}>
                <div style={{ padding: '11px 15px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.role === 'user' ? 'var(--brand)' : 'var(--bg-elevated)', color: msg.role === 'user' ? '#000' : 'var(--text-primary)', fontSize: 14, lineHeight: 1.65, border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none', whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, textAlign: msg.role === 'user' ? 'right' : 'left', display: 'flex', alignItems: 'center', gap: 3, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <Clock size={9} /> {msg.time}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand), #4DFFD2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border)', flexShrink: 0 }}>
                <Bot size={13} color="#000" />
              </div>
              <div style={{ padding: '13px 16px', borderRadius: '18px 18px 18px 4px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', animation: 'bounce 1.2s ease infinite', animationDelay: `${i * 0.2}s` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {activeChat?.messages.length === 1 && (
          <div style={{ padding: '0 16px 8px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SUGGESTIONS.slice(0, 3).map(s => (
              <button key={s} onClick={() => sendMessage(s)} style={{ padding: '6px 12px', borderRadius: 99, border: '1px solid var(--border-strong)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'var(--brand)'; (e.target as HTMLElement).style.color = 'var(--brand)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'var(--border-strong)'; (e.target as HTMLElement).style.color = 'var(--text-secondary)'; }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Sparkles size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input ref={inputRef} className="input-field" placeholder="Ask me anything about your career…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)} style={{ paddingLeft: 38 }} disabled={loading} />
          </div>
          <button className="btn-brand" onClick={() => sendMessage(input)} disabled={loading || !input.trim()} style={{ padding: '0 16px', borderRadius: 12, opacity: !input.trim() ? 0.5 : 1 }}>
            {loading ? <Loader size={15} style={{ animation: 'spin-slow 0.8s linear infinite' }} /> : <Send size={15} />}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,60%,100% { transform:translateY(0); } 30% { transform:translateY(-6px); } }
      `}</style>
    </div>
  );
}

// ── Chat List Item ──
interface ItemProps {
  chat: Conversation; active: boolean; editingId: string | null; editName: string;
  editRef: React.RefObject<HTMLInputElement | null>; deleteConfirm: string | null;
  onSelect: () => void; onStartRename: () => void; onSaveRename: () => void;
  onEditName: (v: string) => void; onCancelEdit: () => void;
  onDeleteConfirm: () => void; onDelete: () => void; onCancelDelete: () => void;
}

function ChatListItem({ chat, active, editingId, editName, editRef, deleteConfirm, onSelect, onStartRename, onSaveRename, onEditName, onCancelEdit, onDeleteConfirm, onDelete, onCancelDelete }: ItemProps) {
  const isEditing = editingId === chat.id;
  const isDeleting = deleteConfirm === chat.id;
  const lastMsg = chat.messages[chat.messages.length - 1];
  const preview = lastMsg?.content.slice(0, 40) + (lastMsg?.content.length > 40 ? '…' : '');

  return (
    <div style={{ borderRadius: 10, marginBottom: 2, background: active ? 'var(--brand-subtle)' : 'transparent', border: `1px solid ${active ? 'rgba(0,200,150,0.2)' : 'transparent'}`, transition: 'all 0.2s ease', overflow: 'hidden' }}>
      {isDeleting ? (
        <div style={{ padding: '10px 10px', fontSize: 12 }}>
          <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 8 }}>Delete this chat?</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={onDelete} style={{ flex: 1, padding: '5px', borderRadius: 7, background: '#EF4444', border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            <button onClick={onCancelDelete} style={{ flex: 1, padding: '5px', borderRadius: 7, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      ) : isEditing ? (
        <div style={{ padding: '8px 8px', display: 'flex', gap: 5, alignItems: 'center' }}>
          <input ref={editRef} value={editName} onChange={e => onEditName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') onSaveRename(); if (e.key === 'Escape') onCancelEdit(); }} style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--brand)', borderRadius: 7, padding: '5px 8px', fontSize: 12, color: 'var(--text-primary)', outline: 'none' }} />
          <button onClick={onSaveRename} style={{ background: 'var(--brand)', border: 'none', borderRadius: 6, padding: 5, cursor: 'pointer', display: 'flex' }}><Check size={12} color="#000" /></button>
          <button onClick={onCancelEdit} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: 5, cursor: 'pointer', display: 'flex' }}><X size={12} color="var(--text-muted)" /></button>
        </div>
      ) : (
        <div onClick={onSelect} style={{ padding: '9px 10px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <MessageSquare size={13} color={active ? 'var(--brand)' : 'var(--text-muted)'} style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: active ? 'var(--brand)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{preview}</div>
          </div>
          <div style={{ display: 'flex', gap: 2, flexShrink: 0, opacity: 0 }} className="chat-actions">
            <button onClick={e => { e.stopPropagation(); onStartRename(); }} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', borderRadius: 5, color: 'var(--text-muted)' }} title="Rename"><Pencil size={11} /></button>
            <button onClick={e => { e.stopPropagation(); onDeleteConfirm(); }} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', borderRadius: 5, color: '#EF4444' }} title="Delete"><Trash2 size={11} /></button>
          </div>
        </div>
      )}
      <style>{`.chat-actions { opacity: 0 !important; } div:hover > div > .chat-actions { opacity: 1 !important; }`}</style>
    </div>
  );
}
