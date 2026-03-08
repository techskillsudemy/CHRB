// src/components/Layout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useState, useEffect } from 'react';
import produitsService from '../services/produitsService.js';

/* ── Premium icon set ─────────────────────────────────────── */
const Icon = {
  Dashboard: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="3.2"/><circle cx="16" cy="8" r="3.2"/><circle cx="8" cy="16" r="3.2"/><circle cx="16" cy="16" r="3.2"/>
    </svg>
  ),
  Clipboard: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Swap: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3L4 7l4 4"/><path d="M4 7h16"/><path d="M16 21l4-4-4-4"/><path d="M20 17H4"/>
    </svg>
  ),
  Box: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  Clock: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 15.5"/>
    </svg>
  ),
  Chart: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      <polyline points="3 20 21 20"/>
    </svg>
  ),
  Hospital: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21V12h6v9"/><path d="M12 7v4m-2-2h4"/>
    </svg>
  ),
  Users: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  LogOut: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Menu: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
  ),
};

const roleLabels = { super_admin: 'Super Admin', responsable: 'Responsable', directeur: 'Directeur', agent: 'Agent' };
const roleColors = {
  super_admin: { bg: 'rgba(142,143,247,0.12)', color: '#6C6DF0', border: 'rgba(142,143,247,0.22)' },
  responsable: { bg: 'rgba(109,212,160,0.12)', color: '#3BB078', border: 'rgba(109,212,160,0.22)' },
  directeur:   { bg: 'rgba(245,201,106,0.15)', color: '#B88A20', border: 'rgba(245,201,106,0.25)' },
  agent:       { bg: 'rgba(139,144,176,0.10)', color: '#8B90B0', border: 'rgba(139,144,176,0.18)' },
};

export default function Layout() {
  const { user, role, hopital, hopitalCode, signOut } = useAuth();
  const navigate = useNavigate();
  const [alertCount, setAlertCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (hopitalCode) {
      Promise.all([
        produitsService.getExpiringCount(hopitalCode),
        produitsService.getExpiredCount(hopitalCode),
      ]).then(([expiring, expired]) => setAlertCount(expiring + expired));
    }
  }, [hopitalCode]);

  const handleSignOut = async () => { await signOut(); navigate('/login'); };
  const isAdmin = role === 'super_admin';

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Tableau de bord', Icon: Icon.Dashboard },
    { to: '/admin/hopitaux', label: 'Établissements', Icon: Icon.Hospital },
    { to: '/admin/utilisateurs', label: 'Utilisateurs', Icon: Icon.Users },
  ];
  const depotLinks = [
    { to: '/depot/dashboard', label: 'Tableau de bord', Icon: Icon.Dashboard },
    { to: '/depot/saisie', label: 'Inventaire', Icon: Icon.Clipboard, roles: ['responsable', 'agent', 'super_admin'] },
    { to: '/depot/mouvements', label: 'Mouvements', Icon: Icon.Swap, roles: ['responsable', 'agent', 'super_admin'] },
    { to: '/depot/stock', label: 'Catalogue', Icon: Icon.Box, alert: alertCount },
    { to: '/depot/historique', label: 'Historique', Icon: Icon.Clock },
    { to: '/depot/rapport', label: 'Rapports', Icon: Icon.Chart, roles: ['responsable', 'directeur', 'super_admin'] },
  ];
  const links = isAdmin ? adminLinks : depotLinks.filter(l => !l.roles || l.roles.includes(role));
  const rc = roleColors[role] || roleColors.agent;

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #EDE9F9 0%, #E8F0FE 40%, #E6F4EC 100%)' }}>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(45,47,69,0.22)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          width: collapsed ? '68px' : '225px',
          minWidth: collapsed ? '68px' : '225px',
          background: 'rgba(255,255,255,0.90)',
          backdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(142,143,247,0.10)',
          boxShadow: '2px 0 20px rgba(142,143,247,0.06)',
        }}
      >
        {/* Logo row */}
        <div
          className="flex items-center shrink-0 px-3.5"
          style={{ height: '60px', borderBottom: '1px solid rgba(142,143,247,0.08)' }}
        >
          <div
            className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #8E8FF7 0%, #6C6DF0 100%)', boxShadow: '0 3px 10px rgba(142,143,247,0.35)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="3.5"/>
              <path d="M9 3v18M3 9h6M3 15h6M15 9h6M15 15h6"/>
            </svg>
          </div>
          {!collapsed && (
            <div className="ml-2.5 flex-1 min-w-0 overflow-hidden">
              <p className="text-[0.8rem] font-bold tracking-tight leading-none whitespace-nowrap" style={{ fontFamily: 'var(--font-display)', color: '#2D2F45' }}>PharmaDépôt</p>
              <p className="text-[0.6rem] mt-0.5 leading-none whitespace-nowrap" style={{ color: '#A8AACC' }}>Gestion pharmaceutique</p>
            </div>
          )}
          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="hidden lg:flex w-6 h-6 items-center justify-center rounded-lg cursor-pointer transition-all flex-shrink-0 ml-auto"
            style={{ color: '#C0C2DC', background: 'rgba(142,143,247,0.07)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(142,143,247,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(142,143,247,0.07)'}
            title={collapsed ? 'Développer' : 'Réduire'}
          >
            {collapsed ? <Icon.ChevronRight /> : <Icon.ChevronLeft />}
          </button>
        </div>

        {/* Facility chip */}
        {hopital && !collapsed && (
          <div className="mx-3 mt-4 px-3 py-2.5 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(142,143,247,0.07), rgba(168,199,255,0.07))', border: '1px solid rgba(142,143,247,0.10)' }}>
            <p className="text-[0.57rem] font-semibold uppercase tracking-[0.14em] mb-0.5" style={{ color: '#B8BAD8' }}>Établissement</p>
            <p className="text-[0.78rem] font-semibold leading-tight truncate" style={{ color: '#2D2F45' }}>{hopital.nom}</p>
            <p className="text-[0.63rem] font-mono mt-0.5" style={{ color: '#8E8FF7' }}>{hopital.code}</p>
          </div>
        )}
        {hopital && collapsed && (
          <div className="mx-auto mt-4 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(142,143,247,0.08)', border: '1px solid rgba(142,143,247,0.12)' }} title={hopital.nom}>
            <span className="text-xs font-bold" style={{ color: '#8E8FF7' }}>{hopital.code?.slice(0, 2)}</span>
          </div>
        )}

        {/* Section label */}
        {!collapsed ? (
          <p className="px-4 pt-5 pb-2 text-[0.57rem] font-bold uppercase tracking-[0.16em]" style={{ color: '#C8CADC' }}>Navigation</p>
        ) : (
          <div className="mt-4" />
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden" style={{ padding: collapsed ? '0 10px' : '0 8px' }}>
          <div className="space-y-0.5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? link.label : undefined}
                style={({ isActive }) => isActive ? {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : undefined,
                  gap: collapsed ? undefined : '10px',
                  padding: collapsed ? '10px 0' : '9px 12px',
                  borderRadius: '12px',
                  background: 'rgba(142,143,247,0.13)',
                  color: '#6C6DF0',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  width: collapsed ? '44px' : undefined,
                  margin: collapsed ? '0 auto' : undefined,
                } : {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : undefined,
                  gap: collapsed ? undefined : '10px',
                  padding: collapsed ? '10px 0' : '9px 12px',
                  borderRadius: '12px',
                  color: '#9498BC',
                  fontSize: '0.8rem',
                  width: collapsed ? '44px' : undefined,
                  margin: collapsed ? '0 auto' : undefined,
                }}
                className="transition-all duration-150 cursor-pointer hover:bg-[rgba(142,143,247,0.07)] hover:text-[#6C6DF0]"
              >
                {({ isActive }) => (
                  <>
                    <span className="flex-shrink-0" style={{ color: isActive ? '#7B7CF5' : 'inherit' }}>
                      <link.Icon />
                    </span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{link.label}</span>
                        {link.alert > 0 && (
                          <span
                            className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1"
                            style={{ background: 'linear-gradient(135deg, #F28B8B, #E66767)' }}
                          >
                            {link.alert}
                          </span>
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User section */}
        <div className="px-3 py-4 shrink-0" style={{ borderTop: '1px solid rgba(142,143,247,0.08)' }}>
          {!collapsed ? (
            <div>
              <div className="flex items-center gap-2.5 mb-2.5 px-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[0.78rem] font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #C8C9F8, #A8C7FF)', color: '#4B4DA0' }}
                >
                  {user?.nom?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.78rem] font-semibold leading-none truncate" style={{ color: '#2D2F45' }}>{user?.nom}</p>
                  <span
                    className="inline-block mt-1.5 px-2 py-[2px] rounded-full text-[0.58rem] font-semibold"
                    style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}
                  >
                    {roleLabels[role] || role}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-[0.75rem] rounded-xl transition-all cursor-pointer"
                style={{ color: '#A8AACC' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(242,139,139,0.08)'; e.currentTarget.style.color = '#D65E5E'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A8AACC'; }}
              >
                <Icon.LogOut />
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[0.78rem] font-bold cursor-default"
                style={{ background: 'linear-gradient(135deg, #C8C9F8, #A8C7FF)', color: '#4B4DA0' }}
                title={user?.nom}
              >
                {user?.nom?.charAt(0) || 'U'}
              </div>
              <button
                onClick={handleSignOut}
                title="Déconnexion"
                className="w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer transition-all"
                style={{ color: '#B0B3CC' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(242,139,139,0.10)'; e.currentTarget.style.color = '#D65E5E'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#B0B3CC'; }}
              >
                <Icon.LogOut />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center px-4 lg:px-6 gap-4 shrink-0"
          style={{
            height: '60px',
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(142,143,247,0.08)',
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer transition-all"
            style={{ color: '#8B90B0', background: 'rgba(142,143,247,0.07)' }}
          >
            <Icon.Menu />
          </button>
          <div className="flex-1" />
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(142,143,247,0.07)', border: '1px solid rgba(142,143,247,0.10)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: '#A8AACC' }}>
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            <span className="text-[0.7rem] font-medium" style={{ color: '#A8AACC' }}>
              {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
