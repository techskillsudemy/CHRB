// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import StatCard from '../../components/ui/StatCard.jsx';
import hopitauxService from '../../services/hopitauxService.js';
import usersService from '../../services/usersService.js';
import inventaireService from '../../services/inventaireService.js';
import produitsService from '../../services/produitsService.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AdminDashboard() {
  const [hopitaux, setHopitaux] = useState([]);
  const [stats, setStats] = useState({
    totalHopitaux: 0,
    totalUsers: 0,
    totalInventaires: 0,
    valeurTotale: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [hopitauxDetails, setHopitauxDetails] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const hList = await hopitauxService.getHopitaux();
    const uList = await usersService.getUsers();
    setHopitaux(hList);

    const currentMonth = new Date().toISOString().slice(0, 7);
    let totalInv = 0;
    let totalVal = 0;
    const details = [];
    const chart = [];

    for (const h of hList) {
      const produits = await produitsService.getProduits(h.code);
      const inventaires = await inventaireService.getInventaires(h.code);
      const currentInv = inventaires.find((i) => i.mois === currentMonth);
      const lignes = currentInv ? await inventaireService.getLignes(currentInv.id) : [];

      const valeurTheo = produits.reduce((s, p) => s + p.stock_theorique * p.pua, 0);
      const valeurPhys = lignes.reduce((s, l) => {
        const prod = produits.find((p) => p.id === l.produit_id);
        return s + (l.stock_physique || 0) * (prod?.pua || 0);
      }, 0);

      totalVal += valeurTheo;
      totalInv += inventaires.filter((i) => i.mois === currentMonth).length;

      details.push({
        id: h.id,
        nom: h.nom,
        code: h.code,
        ville: h.ville,
        nbProduits: produits.length,
        statut: currentInv?.statut || 'non_commence',
        valeurStock: valeurTheo,
        lastActivity: inventaires[0]?.mois || '—',
      });

      chart.push({
        name: h.code,
        theorique: Math.round(valeurTheo * 100) / 100,
        physique: Math.round(valeurPhys * 100) / 100,
      });
    }

    setStats({
      totalHopitaux: hList.filter((h) => h.actif).length,
      totalUsers: uList.length,
      totalInventaires: totalInv,
      valeurTotale: totalVal,
    });
    setHopitauxDetails(details);
    setChartData(chart);
  };

  const statutLabel = (s) => {
    switch (s) {
      case 'en_cours': return { text: 'En cours', cls: 'bg-accent/20 text-accent' };
      case 'cloture': return { text: 'Clôturé', cls: 'bg-success/20 text-success' };
      default: return { text: 'Non commencé', cls: 'bg-surface2 text-muted' };
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-6">Tableau de bord</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Établissements actifs" value={stats.totalHopitaux} icon="🏥" />
        <StatCard label="Utilisateurs total" value={stats.totalUsers} icon="👥" />
        <StatCard label="Inventaires ce mois" value={stats.totalInventaires} icon="📋" />
        <StatCard label="Valeur stock totale" value={stats.valeurTotale} icon="💰" monetary />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-ink mb-4">
            Valeur physique vs théorique par établissement
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F3535" />
              <XAxis dataKey="name" stroke="#3D6B6B" fontSize={12} />
              <YAxis stroke="#3D6B6B" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111919',
                  border: '1px solid #1F3535',
                  borderRadius: '8px',
                  color: '#F0FAFA',
                }}
              />
              <Legend />
              <Bar dataKey="theorique" name="Théorique" fill="#C9A84C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="physique" name="Physique" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Hospitals table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-ink">Établissements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface2 border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Nom</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Ville</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Produits</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Statut inv.</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase">Valeur stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {hopitauxDetails.map((h) => {
                const s = statutLabel(h.statut);
                return (
                  <tr key={h.id} className="hover:bg-surface2/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">{h.nom}</td>
                    <td className="px-4 py-3 font-mono text-muted text-xs">{h.code}</td>
                    <td className="px-4 py-3 text-muted">{h.ville}</td>
                    <td className="px-4 py-3 font-mono">{h.nbProduits}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
                        {s.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gold">
                      {h.valeurStock.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} $
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
