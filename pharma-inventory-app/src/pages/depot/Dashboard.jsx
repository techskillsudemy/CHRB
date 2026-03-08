// src/pages/depot/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import produitsService from '../../services/produitsService.js';
import { getLots } from '../../services/lotsService.js';

const CARDS = [
  {
    key: 'produits',
    label: 'CATALOGUE',
    sublabel: 'produits enregistrés',
    gradient: 'linear-gradient(135deg, #8E8FF7 0%, #7B7CF5 100%)',
    glow: 'rgba(142,143,247,0.22)',
    bg: 'rgba(142,143,247,0.08)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2l9 4.5V18L12 22 3 17.5V6.5L12 2z"/><path d="M12 2v20M3 6.5l9 4.5 9-4.5"/>
      </svg>
    ),
  },
  {
    key: 'lots',
    label: 'LOTS ACTIFS',
    sublabel: 'lots en inventaire',
    gradient: 'linear-gradient(135deg, #A8C7FF 0%, #7EB3FF 100%)',
    glow: 'rgba(168,199,255,0.25)',
    bg: 'rgba(168,199,255,0.12)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
  },
  {
    key: 'expiring',
    label: 'EXPIRANT BIENTÔT',
    sublabel: 'lots dans 3 mois',
    gradient: 'linear-gradient(135deg, #F5C96A 0%, #F0B040 100%)',
    glow: 'rgba(245,201,106,0.28)',
    bg: 'rgba(245,201,106,0.10)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
      </svg>
    ),
  },
  {
    key: 'valeur',
    label: 'VALEUR DU STOCK',
    sublabel: 'valorisation totale',
    gradient: 'linear-gradient(135deg, #6DD4A0 0%, #4EC48A 100%)',
    glow: 'rgba(109,212,160,0.25)',
    bg: 'rgba(109,212,160,0.10)',
    monetary: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
  },
];

export default function DepotDashboard() {
  const { hopitalCode, hopital, role } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ produits: 0, lots: 0, expiring: 0, valeur: 0 });
  const [recentLots, setRecentLots] = useState([]);
  const now = new Date();
  const dateLabel = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    if (!hopitalCode) return;
    const load = async () => {
      const produits = await produitsService.getProduits(hopitalCode);
      const expiring = await produitsService.getExpiringCount(hopitalCode);
      const lots = getLots(hopitalCode);
      const valeur = produits.reduce((s, p) => s + p.stock_theorique * p.pua, 0);
      setStats({ produits: produits.length, lots: lots.length, expiring, valeur });
      setRecentLots(lots.slice(0, 5));
    };
    load();
  }, [hopitalCode]);

  const canEdit = role === 'responsable' || role === 'agent' || role === 'super_admin';

  return (
    <div className="space-y-8">

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: '#A8AACC' }}>Tableau de bord</p>
          <h1
            className="text-[1.75rem] font-bold tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: '#2D2F45' }}
          >
            {hopital?.nom}
          </h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className="flex items-center gap-2 px-3.5 py-2 rounded-full text-[0.72rem] font-medium"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(142,143,247,0.15)', color: '#8B90B0' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            <span style={{ textTransform: 'capitalize' }}>{dateLabel}</span>
          </div>
          {canEdit && (
            <button
              onClick={() => navigate('/depot/mouvements')}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-[0.78rem] font-semibold transition-all active:scale-[0.97] cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #8E8FF7 0%, #7B7CF5 100%)',
                boxShadow: '0 4px 16px rgba(142,143,247,0.30)',
                letterSpacing: '0.04em',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Nouveau mouvement
            </button>
          )}
        </div>
      </div>

      {/* ─── Stat cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CARDS.map((card) => {
          const raw = stats[card.key];
          const display = card.monetary
            ? (raw || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' $'
            : (raw ?? 0);
          const iconColor = card.gradient.includes('#8E8FF7') ? '#7B7CF5'
            : card.gradient.includes('#A8C7FF') ? '#5A9FEF'
            : card.gradient.includes('#F5C96A') ? '#C8940A' : '#3DB87A';
          return (
            <div
              key={card.key}
              className="relative rounded-2xl p-4 overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(142,143,247,0.10)',
                boxShadow: `0 2px 12px ${card.glow}, 0 1px 3px rgba(0,0,0,0.02)`,
                transition: 'transform 0.18s, box-shadow 0.18s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 22px ${card.glow}, 0 2px 6px rgba(0,0,0,0.04)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 2px 12px ${card.glow}, 0 1px 3px rgba(0,0,0,0.02)`; }}
            >
              {/* Accent bar */}
              <div className="absolute top-0 left-0 right-0 h-[2.5px] rounded-t-2xl" style={{ background: card.gradient }} />

              {/* Icon + label row */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-[0.57rem] font-bold uppercase tracking-[0.13em] leading-none" style={{ color: '#B0B2CC' }}>{card.label}</p>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: card.bg, color: iconColor }}
                >
                  {card.icon}
                </div>
              </div>

              {/* Value */}
              <div
                className="text-[1.7rem] font-bold leading-none mb-1.5 tabular-nums"
                style={{ fontFamily: 'var(--font-display)', color: iconColor }}
              >
                {display}
              </div>

              {/* Sublabel */}
              <p className="text-[0.67rem] leading-none" style={{ color: '#C0C2DC' }}>
                {card.sublabel}
              </p>
            </div>
          );
        })}
      </div>

      {/* ─── Recent lots ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] mb-0.5" style={{ color: '#A8AACC' }}>Inventaire</p>
            <h2 className="text-base font-bold" style={{ fontFamily: 'var(--font-display)', color: '#2D2F45' }}>Lots récents</h2>
          </div>
          {recentLots.length > 0 && (
            <button
              onClick={() => navigate('/depot/stock')}
              className="text-[0.72rem] font-medium transition-colors hover:text-accent cursor-pointer"
              style={{ color: '#A8AACC', letterSpacing: '0.05em' }}
            >
              Voir tout →
            </button>
          )}
        </div>

        {recentLots.length === 0 ? (
          <div
            className="rounded-[20px] p-10 flex flex-col items-center text-center"
            style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px dashed rgba(142,143,247,0.20)' }}
          >
            <div
              className="w-14 h-14 rounded-[18px] flex items-center justify-center mb-4"
              style={{ background: 'rgba(142,143,247,0.08)' }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8E8FF7" strokeWidth="1.6" strokeLinecap="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
              </svg>
            </div>
            <p className="font-semibold text-[0.85rem] mb-1" style={{ color: '#2D2F45', fontFamily: 'var(--font-display)' }}>Aucun lot en stock</p>
            <p className="text-[0.78rem] mb-5" style={{ color: '#B0B3CC' }}>Enregistrez une entrée pour créer votre premier lot</p>
            {canEdit && (
              <button
                onClick={() => navigate('/depot/mouvements')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-[0.78rem] font-semibold cursor-pointer transition-all active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg, #8E8FF7 0%, #7B7CF5 100%)', boxShadow: '0 4px 16px rgba(142,143,247,0.28)', letterSpacing: '0.04em' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                Première entrée
              </button>
            )}
          </div>
        ) : (
          <div
            className="rounded-[20px] overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(142,143,247,0.10)', boxShadow: '0 2px 12px rgba(142,143,247,0.06)' }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(142,143,247,0.08)' }}>
                  {['PRODUIT', 'LOT', 'EXPIRATION', 'QTÉ'].map((h, i) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[0.6rem] font-semibold uppercase tracking-[0.16em]" style={{ color: '#A8AACC', textAlign: i === 3 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLots.map((lot, idx) => (
                  <tr key={lot.id} style={{ borderBottom: idx < recentLots.length - 1 ? '1px solid rgba(142,143,247,0.06)' : 'none' }}>
                    <td className="px-5 py-3.5 text-sm font-medium" style={{ color: '#2D2F45' }}>{lot.produit_nom}</td>
                    <td className="px-5 py-3.5 text-xs font-mono" style={{ color: '#8B90B0' }}>{lot.lot_number}</td>
                    <td className="px-5 py-3.5 text-xs font-mono" style={{ color: lot.date_expiration ? '#8B90B0' : '#C0C2DC' }}>
                      {lot.date_expiration || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold font-mono text-right" style={{ color: '#7B7CF5' }}>{lot.quantite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
