// src/pages/depot/Dashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import produitsService from '../../services/produitsService.js';
import { getLots } from '../../services/lotsService.js';
import { getMouvements } from '../../services/mouvementsService.js';

/* ── Animated counter hook ─────────────────────────────── */
function useAnimatedValue(target, duration = 900) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => ref.current && cancelAnimationFrame(ref.current);
  }, [target, duration]);
  return value;
}

/* ── Icons ─────────────────────────────────────────────── */
const Icons = {
  Package: (props) => (
    <svg width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l9 4.5V18L12 22 3 17.5V6.5L12 2z"/><path d="M12 2v20"/><path d="M3 6.5l9 4.5 9-4.5"/>
    </svg>
  ),
  Briefcase: (props) => (
    <svg width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
  ),
  Clock: (props) => (
    <svg width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
    </svg>
  ),
  Dollar: (props) => (
    <svg width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
  ),
  ArrowUpRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
  ),
  ArrowDownRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 17 7 17"/></svg>
  ),
  Calendar: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
  ),
  AlertTriangle: (props) => (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
  ),
  Activity: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  ),
  Clipboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Swap: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3L4 7l4 4"/><path d="M4 7h16"/><path d="M16 21l4-4-4-4"/><path d="M20 17H4"/></svg>
  ),
  BarChart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  ),
  Shield: (props) => (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
};

/* ── Card configs ──────────────────────────────────────── */
const STAT_CARDS = [
  {
    key: 'produits',
    label: 'Catalogue',
    sublabel: 'produits enregistrés',
    color: '#7B7CF5',
    lightBg: 'rgba(142,143,247,0.06)',
    gradient: 'linear-gradient(135deg, #8E8FF7, #7B7CF5)',
    iconBg: 'rgba(142,143,247,0.10)',
    Icon: Icons.Package,
  },
  {
    key: 'lots',
    label: 'Lots actifs',
    sublabel: 'lots en inventaire',
    color: '#5A9FEF',
    lightBg: 'rgba(168,199,255,0.06)',
    gradient: 'linear-gradient(135deg, #A8C7FF, #7EB3FF)',
    iconBg: 'rgba(168,199,255,0.12)',
    Icon: Icons.Briefcase,
  },
  {
    key: 'expiring',
    label: 'Expirant bientôt',
    sublabel: 'lots dans 3 mois',
    color: '#C8940A',
    lightBg: 'rgba(245,201,106,0.06)',
    gradient: 'linear-gradient(135deg, #F5C96A, #F0B040)',
    iconBg: 'rgba(245,201,106,0.12)',
    Icon: Icons.Clock,
  },
  {
    key: 'valeur',
    label: 'Valeur du stock',
    sublabel: 'valorisation totale',
    color: '#3DB87A',
    lightBg: 'rgba(109,212,160,0.06)',
    gradient: 'linear-gradient(135deg, #6DD4A0, #4EC48A)',
    iconBg: 'rgba(109,212,160,0.12)',
    monetary: true,
    Icon: Icons.Dollar,
  },
];

/* ── Animated stat card ────────────────────────────────── */
function AnimatedStatCard({ card, value }) {
  const animated = useAnimatedValue(card.monetary ? 0 : value, 1200);
  const display = card.monetary
    ? (value || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' $'
    : animated;

  return (
    <div className="dashboard-stat-card group" style={{ '--card-color': card.color, '--card-gradient': card.gradient }}>
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: card.gradient, borderRadius: '16px 16px 0 0' }} />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-[12px] flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: card.iconBg, color: card.color }}>
            <card.Icon size={18} />
          </div>
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em]" style={{ color: '#9498BC' }}>{card.label}</span>
        </div>
      </div>

      <div className="text-[2rem] font-extrabold leading-none mb-1 tabular-nums tracking-tight" style={{ fontFamily: 'var(--font-display)', color: card.color }}>
        {display}
      </div>

      <p className="text-[0.7rem] mt-1" style={{ color: '#B8BAD8' }}>{card.sublabel}</p>
    </div>
  );
}

/* ── Sparkline mini bar chart ──────────────────────────── */
function SparkBars({ data, color }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[3px] h-8">
      {data.map((v, i) => (
        <div
          key={i}
          className="rounded-sm transition-all duration-500"
          style={{
            width: '6px',
            height: `${Math.max((v / max) * 100, 8)}%`,
            background: v > 0 ? color : 'rgba(142,143,247,0.08)',
            opacity: 0.5 + (i / data.length) * 0.5,
            animationDelay: `${i * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Main Dashboard ────────────────────────────────────── */
export default function DepotDashboard() {
  const { hopitalCode, hopital, role, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ produits: 0, lots: 0, expiring: 0, valeur: 0, expired: 0 });
  const [recentLots, setRecentLots] = useState([]);
  const [recentMouvements, setRecentMouvements] = useState([]);
  const [topProduits, setTopProduits] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const dateLabel = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    if (!hopitalCode) return;
    const load = async () => {
      const produits = await produitsService.getProduits(hopitalCode);
      const expiring = await produitsService.getExpiringCount(hopitalCode);
      const expired = await produitsService.getExpiredCount(hopitalCode);
      const lots = getLots(hopitalCode);
      const valeur = produits.reduce((s, p) => s + (p.stock_theorique || 0) * (p.pua || 0), 0);
      const mouvements = await getMouvements(hopitalCode);

      setStats({ produits: produits.length, lots: lots.length, expiring, valeur, expired });
      setRecentLots(lots.slice(0, 5));
      setRecentMouvements(mouvements.slice(0, 6));

      // Top products by stock value
      const sorted = [...produits]
        .map(p => ({ ...p, totalValue: (p.stock_theorique || 0) * (p.pua || 0) }))
        .filter(p => p.totalValue > 0)
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 5);
      setTopProduits(sorted);

      setLoaded(true);
    };
    load();
  }, [hopitalCode]);

  const canEdit = role === 'responsable' || role === 'agent' || role === 'super_admin';

  // Sparkline data from movements (last 7 days activity)
  const sparkData = (() => {
    const days = Array(7).fill(0);
    const today = new Date();
    recentMouvements.forEach(m => {
      const d = new Date(m.created_at);
      const diff = Math.floor((today - d) / 86400000);
      if (diff >= 0 && diff < 7) days[6 - diff] += m.quantite;
    });
    return days;
  })();

  const maxTopValue = topProduits.length > 0 ? topProduits[0].totalValue : 1;

  return (
    <div className="space-y-6 dashboard-page">

      {/* ─── Welcome Header ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4" style={{ animationDelay: '0ms' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#6DD4A0' }} />
            <span className="text-[0.65rem] font-medium" style={{ color: '#9498BC' }}>En ligne</span>
          </div>
          <h1 className="text-[1.6rem] md:text-[1.85rem] font-extrabold tracking-tight leading-tight" style={{ fontFamily: 'var(--font-display)', color: '#2D2F45' }}>
            {greeting}, <span style={{ color: '#8E8FF7' }}>{user?.nom?.split(' ')[0] || 'Utilisateur'}</span>
          </h1>
          <p className="text-[0.82rem] mt-1" style={{ color: '#9498BC' }}>
            Voici l'aperçu de <span className="font-semibold" style={{ color: '#6C6DF0' }}>{hopital?.nom}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="dashboard-date-pill">
            <Icons.Calendar />
            <span style={{ textTransform: 'capitalize' }}>{dateLabel}</span>
          </div>
          {canEdit && (
            <button onClick={() => navigate('/depot/mouvements')} className="dashboard-primary-btn">
              <Icons.Plus />
              Nouveau mouvement
            </button>
          )}
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {STAT_CARDS.map((card, i) => (
          <div key={card.key} style={{ animation: `dashFadeUp 0.5s ease ${100 + i * 80}ms both` }}>
            <AnimatedStatCard card={card} value={stats[card.key]} />
          </div>
        ))}
      </div>

      {/* ─── Alert Banner (if expiring/expired) ─── */}
      {(stats.expiring > 0 || stats.expired > 0) && (
        <div className="dashboard-alert-banner" style={{ animation: 'dashFadeUp 0.5s ease 500ms both' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: stats.expired > 0 ? 'rgba(242,139,139,0.15)' : 'rgba(245,201,106,0.15)' }}>
              <Icons.AlertTriangle size={18} style={{ color: stats.expired > 0 ? '#D65E5E' : '#C8940A' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.82rem] font-semibold" style={{ color: '#2D2F45' }}>
                {stats.expired > 0 ? `${stats.expired} lot${stats.expired > 1 ? 's' : ''} expiré${stats.expired > 1 ? 's' : ''}` : ''}
                {stats.expired > 0 && stats.expiring > 0 ? ' · ' : ''}
                {stats.expiring > 0 ? `${stats.expiring} lot${stats.expiring > 1 ? 's' : ''} expirant bientôt` : ''}
              </p>
              <p className="text-[0.72rem] mt-0.5" style={{ color: '#9498BC' }}>Vérifiez votre inventaire pour éviter des pertes</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/depot/stock')}
            className="text-[0.72rem] font-semibold px-3.5 py-1.5 rounded-lg transition-all flex-shrink-0 cursor-pointer"
            style={{ background: 'rgba(142,143,247,0.08)', color: '#7B7CF5' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(142,143,247,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(142,143,247,0.08)'}
          >
            Voir détails
          </button>
        </div>
      )}

      {/* ─── Quick Actions ─── */}
      {canEdit && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ animation: 'dashFadeUp 0.5s ease 550ms both' }}>
          {[
            { label: 'Saisie inventaire', desc: 'Comptage physique', icon: Icons.Clipboard, to: '/depot/saisie', color: '#8E8FF7', roles: ['responsable', 'agent', 'super_admin'] },
            { label: 'Mouvements', desc: 'Entrées & sorties', icon: Icons.Swap, to: '/depot/mouvements', color: '#5A9FEF', roles: ['responsable', 'agent', 'super_admin'] },
            { label: 'Catalogue', desc: 'Produits & lots', icon: Icons.Package, to: '/depot/stock', color: '#6DD4A0' },
            { label: 'Rapports', desc: 'Analyses & exports', icon: Icons.BarChart, to: '/depot/rapport', color: '#F0B040', roles: ['responsable', 'directeur', 'super_admin'] },
          ].filter(a => !a.roles || a.roles.includes(role)).map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.to)}
              className="dashboard-quick-action group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110" style={{ background: `${action.color}12`, color: action.color }}>
                <action.icon size={17} />
              </div>
              <p className="text-[0.78rem] font-semibold" style={{ color: '#2D2F45' }}>{action.label}</p>
              <p className="text-[0.65rem] mt-0.5" style={{ color: '#B8BAD8' }}>{action.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ animation: 'dashFadeUp 0.5s ease 650ms both' }}>

        {/* Left: Recent Activity */}
        <div className="lg:col-span-3 dashboard-card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'rgba(142,143,247,0.08)', color: '#8E8FF7' }}>
                <Icons.Activity />
              </div>
              <div>
                <h2 className="text-[0.9rem] font-bold" style={{ fontFamily: 'var(--font-display)', color: '#2D2F45' }}>Activité récente</h2>
                <p className="text-[0.65rem]" style={{ color: '#B8BAD8' }}>7 derniers jours</p>
              </div>
            </div>
            <SparkBars data={sparkData} color="#8E8FF7" />
          </div>

          {recentMouvements.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(142,143,247,0.06)' }}>
                <Icons.Activity />
              </div>
              <p className="text-[0.82rem] font-semibold mb-1" style={{ color: '#2D2F45' }}>Aucune activité</p>
              <p className="text-[0.72rem]" style={{ color: '#B8BAD8' }}>Les mouvements de stock apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentMouvements.map((m, i) => {
                const isEntree = m.type === 'entree';
                const time = new Date(m.created_at);
                const timeStr = time.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + ' · ' + time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-[rgba(142,143,247,0.04)]">
                    <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: isEntree ? 'rgba(109,212,160,0.10)' : 'rgba(242,139,139,0.10)', color: isEntree ? '#3DB87A' : '#D65E5E' }}>
                      {isEntree ? <Icons.ArrowDownRight /> : <Icons.ArrowUpRight />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[0.78rem] font-semibold truncate" style={{ color: '#2D2F45' }}>{m.produit_nom}</span>
                        <span className="badge text-[0.6rem]" style={{ background: isEntree ? 'rgba(109,212,160,0.12)' : 'rgba(242,139,139,0.12)', color: isEntree ? '#3BB078' : '#D65E5E', border: `1px solid ${isEntree ? 'rgba(109,212,160,0.20)' : 'rgba(242,139,139,0.20)'}`, padding: '1px 8px' }}>
                          {isEntree ? 'Entrée' : 'Sortie'}
                        </span>
                      </div>
                      <p className="text-[0.65rem] mt-0.5" style={{ color: '#B8BAD8' }}>
                        Lot {m.lot_number} · {timeStr}
                      </p>
                    </div>
                    <span className="text-[0.82rem] font-bold font-mono tabular-nums flex-shrink-0" style={{ color: isEntree ? '#3DB87A' : '#D65E5E' }}>
                      {isEntree ? '+' : '-'}{m.quantite}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {recentMouvements.length > 0 && (
            <button
              onClick={() => navigate('/depot/historique')}
              className="w-full mt-4 py-2.5 text-[0.72rem] font-semibold rounded-xl transition-all cursor-pointer text-center"
              style={{ background: 'rgba(142,143,247,0.05)', color: '#8E8FF7' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(142,143,247,0.10)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(142,143,247,0.05)'}
            >
              Voir tout l'historique
            </button>
          )}
        </div>

        {/* Right: Top Products + Stock overview */}
        <div className="lg:col-span-2 space-y-4">
          {/* Top Products by Value */}
          <div className="dashboard-card">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'rgba(109,212,160,0.08)', color: '#3DB87A' }}>
                <Icons.TrendingUp />
              </div>
              <div>
                <h2 className="text-[0.9rem] font-bold" style={{ fontFamily: 'var(--font-display)', color: '#2D2F45' }}>Top produits</h2>
                <p className="text-[0.65rem]" style={{ color: '#B8BAD8' }}>Par valeur de stock</p>
              </div>
            </div>

            {topProduits.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-[0.75rem]" style={{ color: '#B8BAD8' }}>Aucun produit en stock</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topProduits.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-md flex items-center justify-center text-[0.6rem] font-bold flex-shrink-0" style={{ background: 'rgba(142,143,247,0.08)', color: '#8E8FF7' }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.75rem] font-medium truncate" style={{ color: '#2D2F45' }}>{p.nom}</p>
                      <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(142,143,247,0.06)' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(p.totalValue / maxTopValue) * 100}%`, background: `linear-gradient(90deg, ${STAT_CARDS[3].color}, ${STAT_CARDS[0].color})` }} />
                      </div>
                    </div>
                    <span className="text-[0.7rem] font-bold font-mono tabular-nums flex-shrink-0" style={{ color: '#3DB87A' }}>
                      {p.totalValue.toLocaleString('fr-FR')} $
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stock Health */}
          <div className="dashboard-card">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'rgba(142,143,247,0.08)', color: '#8E8FF7' }}>
                <Icons.Shield size={16} />
              </div>
              <div>
                <h2 className="text-[0.9rem] font-bold" style={{ fontFamily: 'var(--font-display)', color: '#2D2F45' }}>Santé du stock</h2>
                <p className="text-[0.65rem]" style={{ color: '#B8BAD8' }}>Vue d'ensemble</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Lots conformes', value: Math.max(0, stats.lots - stats.expiring - stats.expired), total: stats.lots || 1, color: '#6DD4A0', icon: Icons.Check },
                { label: 'Expirant bientôt', value: stats.expiring, total: stats.lots || 1, color: '#F5C96A', icon: Icons.Clock },
                { label: 'Expirés', value: stats.expired, total: stats.lots || 1, color: '#F28B8B', icon: Icons.AlertTriangle },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15`, color: item.color }}>
                    <item.icon size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[0.72rem] font-medium" style={{ color: '#6B6E8A' }}>{item.label}</span>
                      <span className="text-[0.72rem] font-bold font-mono" style={{ color: item.color }}>{item.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(142,143,247,0.06)' }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%`, background: item.color, minWidth: item.value > 0 ? '8px' : '0' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Recent Lots ─── */}
      <div style={{ animation: 'dashFadeUp 0.5s ease 750ms both' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'rgba(168,199,255,0.10)', color: '#5A9FEF' }}>
              <Icons.Briefcase size={16} />
            </div>
            <div>
              <h2 className="text-[0.9rem] font-bold" style={{ fontFamily: 'var(--font-display)', color: '#2D2F45' }}>Lots récents</h2>
              <p className="text-[0.65rem]" style={{ color: '#B8BAD8' }}>Derniers lots en stock</p>
            </div>
          </div>
          {recentLots.length > 0 && (
            <button
              onClick={() => navigate('/depot/stock')}
              className="text-[0.72rem] font-semibold transition-colors cursor-pointer px-3 py-1.5 rounded-lg"
              style={{ color: '#8E8FF7', background: 'rgba(142,143,247,0.05)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(142,143,247,0.10)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(142,143,247,0.05)'}
            >
              Voir tout &rarr;
            </button>
          )}
        </div>

        {recentLots.length === 0 ? (
          <div className="dashboard-card" style={{ border: '1.5px dashed rgba(142,143,247,0.18)' }}>
            <div className="py-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(142,143,247,0.06)' }}>
                <Icons.Briefcase size={26} />
              </div>
              <p className="text-[0.88rem] font-bold mb-1" style={{ color: '#2D2F45', fontFamily: 'var(--font-display)' }}>Aucun lot en stock</p>
              <p className="text-[0.78rem] mb-5" style={{ color: '#B0B3CC' }}>Enregistrez une entrée pour créer votre premier lot</p>
              {canEdit && (
                <button onClick={() => navigate('/depot/mouvements')} className="dashboard-primary-btn">
                  <Icons.Plus />
                  Première entrée
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="dashboard-card overflow-hidden !p-0">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Produit', 'N° Lot', 'Expiration', 'Quantité'].map((h, i) => (
                    <th key={h} className="px-5 py-3.5 text-[0.62rem] font-bold uppercase tracking-[0.14em]" style={{ color: '#9498BC', textAlign: i === 3 ? 'right' : 'left', background: 'rgba(142,143,247,0.03)', borderBottom: '1px solid rgba(142,143,247,0.08)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLots.map((lot, idx) => {
                  const isExpiringSoon = lot.date_expiration && new Date(lot.date_expiration) <= new Date(now.getFullYear(), now.getMonth() + 3, now.getDate()) && new Date(lot.date_expiration) >= now;
                  const isExpired = lot.date_expiration && new Date(lot.date_expiration) < now;
                  return (
                    <tr key={lot.id} className="transition-colors hover:bg-[rgba(142,143,247,0.03)]" style={{ borderBottom: idx < recentLots.length - 1 ? '1px solid rgba(142,143,247,0.06)' : 'none' }}>
                      <td className="px-5 py-3 text-[0.82rem] font-semibold" style={{ color: '#2D2F45' }}>{lot.produit_nom}</td>
                      <td className="px-5 py-3 text-[0.75rem] font-mono" style={{ color: '#8B90B0' }}>{lot.lot_number}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1 text-[0.72rem] font-mono px-2 py-0.5 rounded-md" style={{ background: isExpired ? 'rgba(242,139,139,0.10)' : isExpiringSoon ? 'rgba(245,201,106,0.10)' : 'transparent', color: isExpired ? '#D65E5E' : isExpiringSoon ? '#C8940A' : '#8B90B0' }}>
                          {lot.date_expiration || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[0.82rem] font-bold font-mono text-right tabular-nums" style={{ color: '#7B7CF5' }}>{lot.quantite}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
