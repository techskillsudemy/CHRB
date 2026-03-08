// src/pages/depot/Historique.jsx
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import inventaireService from '../../services/inventaireService.js';
import produitsService from '../../services/produitsService.js';
import Badge from '../../components/ui/Badge.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

export default function Historique() {
  const { hopitalCode } = useAuth();
  const [inventaires, setInventaires] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [lignesMap, setLignesMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hopitalCode) return;
    const load = async () => {
      setLoading(true);
      const all = await inventaireService.getInventaires(hopitalCode);
      const closed = all.filter((i) => i.statut === 'cloture');
      setInventaires(closed);

      // Pre-load lines for chart data
      const map = {};
      for (const inv of closed.slice(0, 6)) {
        const lignes = await inventaireService.getLignesAvecProduits(hopitalCode, inv.mois);
        map[inv.id] = lignes;
      }
      setLignesMap(map);
      setLoading(false);
    };
    load();
  }, [hopitalCode]);

  const toggleExpand = async (inv) => {
    if (expanded === inv.id) {
      setExpanded(null);
      return;
    }
    if (!lignesMap[inv.id]) {
      const lignes = await inventaireService.getLignesAvecProduits(hopitalCode, inv.mois);
      setLignesMap((prev) => ({ ...prev, [inv.id]: lignes }));
    }
    setExpanded(inv.id);
  };

  const getInvStats = (invId) => {
    const lignes = lignesMap[invId] || [];
    const saisis = lignes.filter((l) => l.stock_physique !== null);
    const valTheo = lignes.reduce((s, l) => s + (l.valeur_theorique || 0), 0);
    const valPhys = saisis.reduce((s, l) => s + (l.valeur_physique || 0), 0);
    const withEcart = saisis.filter((l) => l.ecart !== 0);
    const top5 = [...withEcart]
      .sort((a, b) => Math.abs(b.ecart || 0) - Math.abs(a.ecart || 0))
      .slice(0, 5);
    return { valTheo, valPhys, ecartCount: withEcart.length, top5, totalSaisis: saisis.length };
  };

  const chartData = useMemo(() => {
    return inventaires
      .slice(0, 6)
      .reverse()
      .map((inv) => {
        const lignes = lignesMap[inv.id] || [];
        const valTheo = lignes.reduce((s, l) => s + (l.valeur_theorique || 0), 0);
        const valPhys = lignes
          .filter((l) => l.stock_physique !== null)
          .reduce((s, l) => s + (l.valeur_physique || 0), 0);
        return { mois: inv.mois, theorique: valTheo, physique: valPhys };
      });
  }, [inventaires, lignesMap]);

  const formatMois = (mois) => {
    const [y, m] = mois.split('-');
    const months = ['', 'Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin',
      'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
    return `${months[parseInt(m)]} ${y}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-6">Historique des inventaires</h1>

      {inventaires.length === 0 ? (
        <div className="glass-card p-8 text-center text-muted">
          Aucun inventaire clôturé pour le moment.
        </div>
      ) : (
        <>
          {/* Chart */}
          {chartData.length > 1 && (
            <div className="glass-card p-4 mb-6">
              <h2 className="text-sm font-semibold text-muted mb-4">
                Évolution des valeurs — 6 derniers mois
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E5F1" />
                  <XAxis dataKey="mois" stroke="#8B90B0" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#8B90B0" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: '1px solid #E2E5F1',
                      borderRadius: '12px',
                      color: '#2D2F45',
                      boxShadow: '0 4px 20px rgba(142,143,247,0.10)',
                    }}
                    formatter={(v) => `$${v.toFixed(2)}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="theorique"
                    stroke="#F5C96A"
                    name="Valeur théorique"
                    strokeWidth={2}
                    dot={{ fill: '#F5C96A' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="physique"
                    stroke="#6DD4A0"
                    name="Valeur physique"
                    strokeWidth={2}
                    dot={{ fill: '#6DD4A0' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Inventory cards */}
          <div className="space-y-3">
            {inventaires.map((inv) => {
              const isOpen = expanded === inv.id;
              const s = isOpen ? getInvStats(inv.id) : null;
              return (
                <div
                  key={inv.id}
                  className="glass-card overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpand(inv)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-white/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-accent">
                        {formatMois(inv.mois)}
                      </span>
                      <Badge variant="success">Clôturé</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      {inv.cloture_at && (
                        <span className="text-xs text-muted">
                          Clôturé le {new Date(inv.cloture_at).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      <svg
                        className={`w-4 h-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isOpen && s && (
                    <div className="border-t border-border/50 p-4 space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <StatCard label="Produits saisis" value={s.totalSaisis} small />
                        <StatCard label="Valeur théorique" value={s.valTheo} monetary small />
                        <StatCard label="Valeur physique" value={s.valPhys} monetary small />
                        <StatCard label="Avec écart" value={s.ecartCount} small />
                      </div>

                      {s.top5.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted mb-2">
                            Top 5 écarts
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-muted text-xs uppercase">
                                  <th className="text-left p-2">Produit</th>
                                  <th className="text-right p-2">Théorique</th>
                                  <th className="text-right p-2">Physique</th>
                                  <th className="text-right p-2">Écart</th>
                                </tr>
                              </thead>
                              <tbody>
                                {s.top5.map((l, i) => (
                                  <tr key={i} className="border-t border-border">
                                    <td className="p-2">{l.produit?.nom}</td>
                                    <td className="p-2 text-right font-mono">{l.stock_theorique}</td>
                                    <td className="p-2 text-right font-mono">{l.stock_physique}</td>
                                    <td className={`p-2 text-right font-mono font-semibold ${
                                      l.ecart < 0 ? 'text-danger' : 'text-success'
                                    }`}>
                                      {l.ecart > 0 ? '+' : ''}{l.ecart}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
