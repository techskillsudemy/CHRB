// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const session = await signIn(email, password);
      if (session.role === 'super_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/depot/saisie');
      }
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 overflow-hidden" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0D2020 0%, #070D0D 60%)' }}>
      {/* Animated orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/5 w-[500px] h-[500px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.15) 0%, transparent 70%)', filter: 'blur(1px)' }} />
        <div className="absolute bottom-1/4 right-1/5 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.20) 0%, transparent 70%)' }} />
        <div className="absolute top-2/3 left-1/2 w-[300px] h-[300px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.10) 0%, transparent 70%)' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(45,212,191,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.5) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      <div className="relative w-full max-w-md" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5"
            style={{
              background: 'linear-gradient(135deg, rgba(45,212,191,0.25) 0%, rgba(45,212,191,0.05) 100%)',
              border: '1px solid rgba(45,212,191,0.20)',
              boxShadow: '0 0 40px rgba(45,212,191,0.20)',
            }}
          >
            <span className="text-accent text-4xl">⚕</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-ink tracking-wide mb-1">PharmaDépôt</h1>
          <p className="text-muted text-sm">Système de Gestion d'Inventaire Pharmaceutique</p>
        </div>

        {/* Glass card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'linear-gradient(160deg, rgba(18,28,28,0.95) 0%, rgba(11,18,18,0.98) 100%)',
            border: '1px solid rgba(45,212,191,0.14)',
            boxShadow: '0 0 0 1px rgba(45,212,191,0.05) inset, 0 32px 80px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <h2 className="text-xl font-semibold text-ink mb-2">Connexion</h2>
          <p className="text-muted text-xs mb-6">Entrez vos identifiants pour accéder au système</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-danger text-sm flex items-center gap-2"
              style={{ background: 'rgba(251,113,133,0.10)', border: '1px solid rgba(251,113,133,0.22)' }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Adresse e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-premium w-full"
                placeholder="exemple@depot.cd"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-premium w-full"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl font-semibold text-bg transition-all cursor-pointer disabled:opacity-40 active:scale-[0.98]"
              style={{
                background: loading ? 'rgba(45,212,191,0.6)' : 'linear-gradient(135deg, #2DD4BF 0%, #1BB5A2 100%)',
                boxShadow: loading ? 'none' : '0 0 24px rgba(45,212,191,0.30)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeLinecap="round" />
                  </svg>
                  Connexion en cours…
                </span>
              ) : 'Se connecter'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <a href="#" className="text-xs text-muted hover:text-accent transition-colors">
              Mot de passe oublié ?
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted mt-6 opacity-50">
          © 2026 PharmaDépôt — Système de gestion d'inventaire
        </p>
      </div>
    </div>
  );
}
