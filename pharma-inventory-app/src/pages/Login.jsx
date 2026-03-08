// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const session = await signIn(email, password);
      navigate(session.role === 'super_admin' ? '/admin/dashboard' : '/depot/saisie');
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '0 1rem 0 2.75rem',
    height: '48px',
    borderRadius: '14px',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.2s',
    background: focusedField === field ? 'rgba(255,255,255,0.95)' : 'rgba(245,245,255,0.7)',
    border: focusedField === field
      ? '1.5px solid rgba(142,143,247,0.55)'
      : '1.5px solid rgba(142,143,247,0.15)',
    boxShadow: focusedField === field
      ? '0 0 0 4px rgba(142,143,247,0.10), 0 2px 8px rgba(142,143,247,0.08)'
      : '0 1px 3px rgba(0,0,0,0.04)',
    color: '#2D2F45',
  });

  return (
    <div
      className="min-h-screen flex items-stretch overflow-hidden"
      style={{ background: 'linear-gradient(140deg, #E5DFFE 0%, #DFEAFE 40%, #D8F0E3 100%)' }}
    >
      {/* ─── Left branding panel (hidden on mobile) ─── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col items-center justify-center relative overflow-hidden px-16"
        style={{ background: 'linear-gradient(150deg, rgba(142,143,247,0.92) 0%, rgba(123,124,245,0.88) 40%, rgba(109,212,160,0.70) 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute pointer-events-none" style={{ top: '-60px', right: '-60px', width: 340, height: 340, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', animation: 'float 7s ease-in-out infinite' }} />
        <div className="absolute pointer-events-none" style={{ bottom: '-80px', left: '-80px', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', animation: 'float 9s ease-in-out infinite 1.5s' }} />
        <div className="absolute pointer-events-none" style={{ top: '40%', right: '5%', width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', animation: 'float 6s ease-in-out infinite 3s' }} />

        <div className="relative z-10 text-center max-w-sm" style={{ animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
          {/* App icon */}
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-[26px] mb-6"
            style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(255,255,255,0.35)', boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <path d="M9 3v18M3 9h6M3 15h6M15 9h6M15 15h6"/>
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight" style={{ fontFamily: 'var(--font-display)', textShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            PharmaDépôt
          </h1>
          <p className="text-[0.92rem] text-white/60 mb-10 tracking-wide uppercase" style={{ letterSpacing: '0.12em', fontWeight: 500 }}>
            Gestion pharmaceutique
          </p>

          {/* Feature pills */}
          <div className="flex flex-col gap-2.5">
            {[
              { icon: '📦', text: 'Suivi par lots' },
              { icon: '📊', text: 'Rapports en temps réel' },
              { icon: '🏥', text: 'Multi-établissements' },
            ].map(({ icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-left"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)' }}
              >
                <span className="text-base leading-none">{icon}</span>
                <span className="text-white/80 text-[0.82rem] font-medium tracking-wide">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="absolute bottom-6 text-white/40 text-xs">© 2026 PharmaDépôt</p>
      </div>

      {/* ─── Right form panel ─── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Mobile background orbs */}
        <div className="lg:hidden absolute pointer-events-none" style={{ top: '5%', left: '-5%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(142,143,247,0.18) 0%, transparent 70%)', animation: 'float 6s ease-in-out infinite' }} />
        <div className="lg:hidden absolute pointer-events-none" style={{ bottom: '10%', right: '-5%', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,228,204,0.22) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite 2s' }} />

        <div className="w-full max-w-[420px]" style={{ animation: 'slideUp 0.42s cubic-bezier(0.16,1,0.3,1)' }}>

          {/* Mobile logo (only shown sm/md) */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-[18px] mb-3"
              style={{ background: 'linear-gradient(138deg, #8E8FF7 0%, #7B7CF5 100%)', boxShadow: '0 8px 24px rgba(142,143,247,0.28)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <path d="M9 3v18M3 9h6M3 15h6M15 9h6M15 15h6"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: '#2D2F45' }}>PharmaDépôt</h1>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: '#A8AACC' }}>Bienvenue</p>
            <h2 className="text-[1.75rem] font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: '#2D2F45', lineHeight: 1.1 }}>
              Connexion
            </h2>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2.5 mb-6 px-4 py-3.5 rounded-2xl text-sm leading-snug"
              style={{ background: 'rgba(242,139,139,0.10)', border: '1px solid rgba(242,139,139,0.22)', color: '#C95252' }}
            >
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[0.62rem] font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: '#A8AACC' }}>
                E-mail
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: focusedField === 'email' ? '#8E8FF7' : '#B0B3CC', transition: 'color 0.2s' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="2" y="4" width="20" height="16" rx="3"/>
                    <path d="m2 7 10 7 10-7"/>
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={inputStyle('email')}
                  placeholder="admin@depot.cd"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[0.62rem] font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: '#A8AACC' }}>
                Mot de passe
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: focusedField === 'password' ? '#8E8FF7' : '#B0B3CC', transition: 'color 0.2s' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={{ ...inputStyle('password'), paddingRight: '2.75rem' }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                  style={{ color: showPassword ? '#8E8FF7' : '#B0B3CC', lineHeight: 0 }}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <a href="#" className="text-[0.65rem] font-medium tracking-wide uppercase transition-colors hover:text-accent" style={{ color: '#C0C2DC', letterSpacing: '0.08em' }}>
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl font-semibold text-white transition-all cursor-pointer disabled:opacity-60 active:scale-[0.98] overflow-hidden relative"
                style={{
                  height: '52px',
                  fontSize: '0.85rem',
                  letterSpacing: '0.12em',
                  fontFamily: 'var(--font-display)',
                  background: loading
                    ? 'linear-gradient(135deg, #A5A6F6 0%, #9394F5 100%)'
                    : 'linear-gradient(135deg, #9899F8 0%, #7B7CF5 45%, #6A6BF2 100%)',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(123,124,245,0.38), inset 0 1px 0 rgba(255,255,255,0.18)',
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = '0 8px 32px rgba(123,124,245,0.52), inset 0 1px 0 rgba(255,255,255,0.18)'; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.boxShadow = '0 4px 20px rgba(123,124,245,0.38), inset 0 1px 0 rgba(255,255,255,0.18)'; }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeDasharray="40" strokeLinecap="round" opacity="0.35"/>
                      <path d="M12 3a9 9 0 019 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                    <span style={{ letterSpacing: '0.12em' }}>CONNEXION…</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <span style={{ letterSpacing: '0.12em' }}>SE CONNECTER</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-[0.62rem] mt-8 tracking-wide" style={{ color: '#C8CAE0', letterSpacing: '0.06em' }}>
            © 2026 PHARMADÉPÔT
          </p>
        </div>
      </div>
    </div>
  );
}
