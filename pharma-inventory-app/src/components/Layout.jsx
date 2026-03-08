// src/components/Layout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useState, useEffect } from 'react';
import produitsService from '../services/produitsService.js';

export default function Layout() {
  const { user, role, hopital, hopitalCode, signOut } = useAuth();
  const navigate = useNavigate();
  const [alertCount, setAlertCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (hopitalCode) {
      Promise.all([
        produitsService.getExpiringCount(hopitalCode),
        produitsService.getExpiredCount(hopitalCode),
      ]).then(([expiring, expired]) => setAlertCount(expiring + expired));
    }
  }, [hopitalCode]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isAdmin = role === 'super_admin';

  const roleLabels = {
    super_admin: 'Super Administrateur',
    responsable: 'Responsable',
    directeur: 'Directeur',
    agent: 'Agent de Saisie',
  };

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Tableau de bord', icon: '📊' },
    { to: '/admin/hopitaux', label: 'Établissements', icon: '🏥' },
    { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: '👥' },
  ];

  const depotLinks = [
    { to: '/depot/dashboard', label: 'Tableau de bord', icon: '📊' },
    { to: '/depot/saisie', label: 'Saisie inventaire', icon: '📝', roles: ['responsable', 'agent', 'super_admin'] },
    { to: '/depot/mouvements', label: 'Mouvements', icon: '🔄', roles: ['responsable', 'agent', 'super_admin'] },
    { to: '/depot/stock', label: 'Stock produits', icon: '📦', alert: alertCount },
    { to: '/depot/historique', label: 'Historique', icon: '📜' },
    { to: '/depot/rapport', label: 'Rapport', icon: '📄', roles: ['responsable', 'directeur', 'super_admin'] },
  ];

  const links = isAdmin
    ? adminLinks
    : depotLinks.filter((l) => !l.roles || l.roles.includes(role));

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive ? 'nav-active' : 'text-muted hover:text-ink hover:bg-white/[0.04]'
    }`;

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 sidebar-gradient border-r flex flex-col transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ borderColor: 'rgba(45,212,191,0.10)' }}
      >
        {/* Logo area */}
        <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(45,212,191,0.10)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(45,212,191,0.25), rgba(45,212,191,0.08))' }}>
              <span className="text-accent text-xl">⚕</span>
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-ink tracking-wide">PharmaDépôt</h1>
              <p className="text-xs text-muted">Gestion d'inventaire</p>
            </div>
          </div>
          {/* Gold rule */}
          <div className="mt-3 h-px" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.5), rgba(201,168,76,0.1), transparent)' }} />
        </div>

        {/* Hospital info */}
        {hopital && (
          <div className="px-6 py-3" style={{ borderBottom: '1px solid rgba(45,212,191,0.07)' }}>
            <p className="text-xs text-muted mb-0.5">Établissement</p>
            <p className="text-sm font-medium text-ink truncate">{hopital.nom}</p>
            <p className="text-xs font-mono" style={{ color: 'rgba(45,212,191,0.6)' }}>{hopital.code}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={navLinkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
              {link.alert > 0 && (
                <span className="ml-auto bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {link.alert}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(45,212,191,0.08)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">
              {user?.nom?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{user?.nom}</p>
              <p className="text-xs text-muted">{roleLabels[role] || role}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full px-3 py-2 text-sm text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b flex items-center px-4 lg:px-6 gap-4 shrink-0" style={{ background: 'rgba(10,16,16,0.8)', backdropFilter: 'blur(8px)', borderColor: 'rgba(45,212,191,0.08)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted hover:text-ink cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          <span className="text-xs text-muted font-mono">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
