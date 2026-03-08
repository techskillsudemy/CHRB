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
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-ink mb-4">
            Valeur physique vs théorique par établissement
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E5F1" />
              <XAxis dataKey="name" stroke="#8B90B0" fontSize={12} />
              <YAxis stroke="#8B90B0" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: '1px solid #E2E5F1',
                  borderRadius: '12px',
                  color: '#2D2F45',
                  boxShadow: '0 4px 20px rgba(142,143,247,0.10)',
                }}
              />
              <Legend />
              <Bar dataKey="theorique" name="Théorique" fill="#F5C96A" radius={[6, 6, 0, 0]} />
              <Bar dataKey="physique" name="Physique" fill="#6DD4A0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Hospitals table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(142,143,247,0.08)' }}>
          <h2 className="text-lg font-semibold text-ink">Établissements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr>
                <th className="text-left">Nom</th>
                <th className="text-left">Code</th>
                <th className="text-left">Ville</th>
                <th className="text-left">Produits</th>
                <th className="text-left">Statut inv.</th>
                <th className="text-right">Valeur stock</th>
              </tr>
            </thead>
            <tbody>
              {hopitauxDetails.map((h) => {
                const s = statutLabel(h.statut);
                return (
                  <tr key={h.id}>
                    <td className="font-medium text-ink">{h.nom}</td>
                    <td className="font-mono text-muted text-xs">{h.code}</td>
                    <td className="text-muted">{h.ville}</td>
                    <td className="font-mono">{h.nbProduits}</td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
                        {s.text}
                      </span>
                    </td>
                    <td className="text-right font-mono text-gold">
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
