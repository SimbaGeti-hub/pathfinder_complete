'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  interests?: string[];
  verified?: boolean;
}

interface PendingGoogleUser {
  id: string;
  image: string;
}

interface PendingVerification {
  user: User;
  code: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  pendingGoogleUser: PendingGoogleUser | null;
  pendingVerification: PendingVerification | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, interests: string[]) => Promise<void>;
  verifyCode: (code: string) => boolean;
  resendCode: () => void;
  signInWithGoogle: () => Promise<void>;
  completeGoogleSignIn: (name: string, email: string) => void;
  cancelGoogleSignIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true, pendingGoogleUser: null, pendingVerification: null,
  signIn: async () => {}, signUp: async () => {},
  verifyCode: () => false, resendCode: () => {},
  signInWithGoogle: async () => {}, completeGoogleSignIn: () => {},
  cancelGoogleSignIn: () => {}, signOut: () => {},
});

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<PendingGoogleUser | null>(null);
  const [pendingVerification, setPendingVerification] = useState<PendingVerification | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('pathfinder-user');
    if (saved) { try { setUser(JSON.parse(saved)); } catch {} }
    setLoading(false);
  }, []);

  const persist = (u: User) => {
    setUser(u);
    localStorage.setItem('pathfinder-user', JSON.stringify(u));
  };

  const signIn = async (email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 800));
    const u: User = {
      id: crypto.randomUUID(),
      name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      verified: true,
    };
    persist(u);
  };

  const signUp = async (name: string, email: string, _password: string, interests: string[]) => {
    await new Promise(r => setTimeout(r, 900));
    const u: User = {
      id: crypto.randomUUID(), name, email, interests,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      verified: false,
    };
    const code = generateCode();
    console.log(`%c📧 Pathfinder OTP for ${email}: ${code}`, 'color:#00C896;font-size:20px;font-weight:bold;');
    setPendingVerification({ user: u, code });
  };

  const verifyCode = (entered: string): boolean => {
    if (!pendingVerification) return false;
    if (entered.trim() === pendingVerification.code) {
      persist({ ...pendingVerification.user, verified: true });
      setPendingVerification(null);
      return true;
    }
    return false;
  };

  const resendCode = () => {
    if (!pendingVerification) return;
    const newCode = generateCode();
    console.log(`%c📧 Pathfinder OTP (resent) for ${pendingVerification.user.email}: ${newCode}`, 'color:#00C896;font-size:20px;font-weight:bold;');
    setPendingVerification({ ...pendingVerification, code: newCode });
  };

  // Google — no email passed in; the modal collects both name + email from the user
  const signInWithGoogle = async () => {
    await new Promise(r => setTimeout(r, 1000));
    setPendingGoogleUser({
      id: crypto.randomUUID(),
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=google-${Date.now()}`,
    });
  };

  // Receives BOTH name and email typed by the user inside the modal — no stale data
  const completeGoogleSignIn = (name: string, email: string) => {
    if (!pendingGoogleUser) return;
    const cleanEmail = email.trim().toLowerCase();
    const u: User = {
      id: pendingGoogleUser.id,
      name: name.trim(),
      email: cleanEmail,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
      verified: true,
    };
    persist(u);
    setPendingGoogleUser(null);
  };

  const cancelGoogleSignIn = () => setPendingGoogleUser(null);

  const signOut = () => {
    setUser(null);
    setPendingVerification(null);
    localStorage.removeItem('pathfinder-user');
  };

  return (
    <AuthContext.Provider value={{
      user, loading, pendingGoogleUser, pendingVerification,
      signIn, signUp, verifyCode, resendCode,
      signInWithGoogle, completeGoogleSignIn, cancelGoogleSignIn, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
