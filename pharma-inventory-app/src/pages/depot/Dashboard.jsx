// src/pages/depot/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import produitsService from '../../services/produitsService.js';
import inventaireService from '../../services/inventaireService.js';

export default function DepotDashboard() {
  const { hopitalCode, hopital } = useAuth();
  const [stats, setStats] = useState({ produits: 0, expiring: 0, expired: 0, valeur: 0 });

  useEffect(() => {
    if (!hopitalCode) return;
    const load = async () => {
      const produits = await produitsService.getProduits(hopitalCode);
      const expiring = await produitsService.getExpiringCount(hopitalCode);
      const expired = await produitsService.getExpiredCount(hopitalCode);
      const valeur = produits.reduce((s, p) => s + p.stock_theorique * p.pua, 0);
      setStats({ produits: produits.length, expiring, expired, valeur });
    };
    load();
  }, [hopitalCode]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-6">
        Tableau de bord — {hopital?.nom}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total produits" value={stats.produits} icon="📦" />
        <StatCard label="Expirant bientôt" value={stats.expiring} icon="⚠️" />
        <StatCard label="Expirés" value={stats.expired} icon="🚨" />
        <StatCard label="Valeur du stock" value={stats.valeur} icon="💰" monetary />
      </div>
    </div>
  );
}
