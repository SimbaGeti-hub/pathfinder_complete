'use client';
import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import Dashboard from './components/Dashboard';
import VerifyEmailScreen from './components/VerifyEmailScreen';

export type AppView = 'landing' | 'login' | 'signup' | 'dashboard';

export default function Home() {
  const { user, loading, pendingVerification } = useAuth();
  const [view, setView] = useState<AppView>('landing');

  useEffect(() => {
    if (!loading && user) setView('dashboard');
  }, [user, loading]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>Loading Pathfinder…</p>
      </div>
    </div>
  );

  // Email verification gate — shown before dashboard access
  if (pendingVerification) return <VerifyEmailScreen />;

  if (user) return <Dashboard onNavigate={setView} />;

  switch (view) {
    case 'login':   return <LoginPage onNavigate={setView} />;
    case 'signup':  return <SignUpPage onNavigate={setView} />;
    default:        return <LandingPage onNavigate={setView} />;
  }
}
