'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, Mail, ArrowLeft, RotateCcw, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyEmailScreen() {
  const { pendingVerification, verifyCode, resendCode, signOut } = useAuth();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [shaking, setShaking] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  if (!pendingVerification) return null;

  const handleDigit = (index: number, value: string) => {
    // Allow paste of full code
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const next = [...digits];
      pasted.forEach((d, i) => { if (index + i < 6) next[index + i] = d; });
      setDigits(next);
      const focusIdx = Math.min(index + pasted.length, 5);
      inputRefs.current[focusIdx]?.focus();
      return;
    }
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length < 6) { setError('Please enter all 6 digits.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const ok = verifyCode(code);
    setLoading(false);
    if (ok) {
      toast.success('Email verified! Welcome to Pathfinder 🎉');
    } else {
      setError('Incorrect code. Please try again.');
      setShaking(true);
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => { setShaking(false); inputRefs.current[0]?.focus(); }, 600);
    }
  };

  const handleResend = () => {
    resendCode();
    setDigits(['', '', '', '', '', '']);
    setError('');
    setResendCooldown(30);
    toast.success('A new code has been sent!');
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const maskedEmail = pendingVerification.user.email.replace(
    /^(.{2})(.*)(@.*)$/,
    (_, a, b, c) => a + b.replace(/./g, '•') + c
  );

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '40px 20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Orbs */}
      <div className="orb orb-1" style={{ zIndex: 0 }} />
      <div className="orb orb-2" style={{ zIndex: 0 }} />

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        {/* Back */}
        <button
          className="btn-ghost"
          onClick={() => signOut()}
          style={{ marginBottom: 32, padding: '6px 10px' }}
        >
          <ArrowLeft size={15} /> Back to sign up
        </button>

        <div className="glass-card animate-scale-in" style={{ padding: '44px 40px', textAlign: 'center' }}>
          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, var(--brand-subtle), rgba(0,200,150,0.15))',
            border: '2px solid rgba(0,200,150,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            position: 'relative',
          }}>
            <Mail size={30} color="var(--brand)" />
            <div style={{
              position: 'absolute', bottom: -6, right: -6,
              width: 24, height: 24, borderRadius: '50%',
              background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--bg-card)',
            }}>
              <ShieldCheck size={12} color="#000" />
            </div>
          </div>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Compass size={13} color="#000" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>Pathfinder</span>
          </div>

          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26,
            color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 10,
          }}>
            Check your email
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
            We sent a 6-digit verification code to
          </p>
          <p style={{
            color: 'var(--text-primary)', fontWeight: 700, fontSize: 15,
            marginBottom: 32, fontFamily: 'Syne, sans-serif',
          }}>
            {maskedEmail}
          </p>

          {/* OTP inputs */}
          <div style={{
            display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 8,
            animation: shaking ? 'shake 0.5s ease' : 'none',
          }}>
            <style>{`
              @keyframes shake {
                0%,100% { transform: translateX(0); }
                15% { transform: translateX(-8px); }
                30% { transform: translateX(8px); }
                45% { transform: translateX(-6px); }
                60% { transform: translateX(6px); }
                75% { transform: translateX(-3px); }
                90% { transform: translateX(3px); }
              }
            `}</style>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                style={{
                  width: 52, height: 60,
                  borderRadius: 14,
                  border: `2px solid ${error ? '#EF4444' : d ? 'var(--brand)' : 'var(--border-strong)'}`,
                  background: d ? 'var(--brand-subtle)' : 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: 24, fontWeight: 800,
                  fontFamily: 'Syne, sans-serif',
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'text',
                  boxShadow: d ? '0 0 0 3px var(--brand-glow)' : 'none',
                }}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 16,
              background: '#EF444415', border: '1px solid #EF444435',
              color: '#EF4444', fontSize: 13, marginTop: 12,
            }}>
              {error}
            </div>
          )}

          {/* Hint for demo */}
          <div style={{
            margin: '16px 0 24px',
            padding: '10px 14px', borderRadius: 10,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6,
          }}>
            💡 <strong style={{ color: 'var(--text-secondary)' }}>Demo mode:</strong> Open your browser's DevTools console (F12) to see your verification code.
          </div>

          {/* Verify button */}
          <button
            className="btn-brand"
            onClick={handleVerify}
            disabled={loading || digits.join('').length < 6}
            style={{
              width: '100%', justifyContent: 'center',
              padding: '14px', fontSize: 15, borderRadius: 13,
              opacity: digits.join('').length < 6 ? 0.5 : 1,
              marginBottom: 16,
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid #00000040', borderTopColor: '#000', borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite' }} />
                Verifying…
              </>
            ) : (
              <><ShieldCheck size={16} /> Verify Email</>
            )}
          </button>

          {/* Resend */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Didn't receive it?</span>
            {resendCooldown > 0 ? (
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                onClick={handleResend}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--brand)', fontSize: 13,
                  fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: 0,
                }}
              >
                <RotateCcw size={12} /> Resend code
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
