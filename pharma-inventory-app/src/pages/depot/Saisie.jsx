// src/pages/depot/Saisie.jsx
import { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useInventaire } from '../../hooks/useInventaire.js';
import StatCard from '../../components/ui/StatCard.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

function getMonthOptions() {
  const opts = [];
  const now = new Date();
  for (let i = -3; i <= 1; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const val = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
    opts.push({ value: val, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return opts;
}

export default function Saisie() {
  const { hopitalCode, user, canCloturer, canSaisir } = useAuth();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [mois, setMois] = useState(currentMonth);
  const [filter, setFilter] = useState('tous');
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  const { inventaire, lignes, loading, updateStockPhysique, cloturer, stats } =
    useInventaire(hopitalCode, mois);

  const isCloture = inventaire?.statut === 'cloture';
  const monthOptions = getMonthOptions();

  const filteredLignes = useMemo(() => {
    let result = lignes;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((l) => l.produit.nom.toLowerCase().includes(s));
    }
    switch (filter) {
      case 'saisi':
        return result.filter((l) => l.stock_physique !== null);
      case 'non_saisi':
        return result.filter((l) => l.stock_physique === null);
      case 'ecart':
        return result.filter((l) => l.ecart !== null && l.ecart !== 0);
      default:
        return result;
    }
  }, [lignes, filter, search]);

  const handleCloturer = async () => {
    if (!confirm('Êtes-vous sûr de vouloir clôturer cet inventaire ? Cette action est irréversible.'))
      return;
    await cloturer(user.id);
    addToast('Inventaire clôturé avec succès');
  };

  const getRowBorderClass = (ligne) => {
    const now = new Date();
    const exp = new Date(ligne.produit.date_expiration);
    const threeMonths = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());

    if (exp < now) return 'border-l-3 border-l-danger';
    if (exp <= threeMonths) return 'border-l-3 border-l-warn';
    if (ligne.ecart !== null && ligne.ecart !== 0) return 'border-l-3 border-l-gold';
    return '';
  };

  if (loading) {
    return <div className="text-center text-muted py-12">Chargement…</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Saisie d'inventaire</h1>
          <div className="flex items-center gap-3 mt-2">
            <select
              value={mois}
              onChange={(e) => setMois(e.target.value)}
              className="px-3 py-1.5 bg-surface2 border border-border rounded-lg text-ink text-sm"
            >
              {monthOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <Badge variant={isCloture ? 'success' : 'accent'}>
              {isCloture ? 'CLÔTURÉ' : 'EN COURS'}
            </Badge>
          </div>
        </div>

        {canCloturer() && !isCloture && (
          <Button variant="gold" onClick={handleCloturer}>
            Clôturer l'inventaire
          </Button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted mb-1">
          <span>Progression de la saisie</span>
          <span className="font-mono">{stats.progression}%</span>
        </div>
        <div className="w-full h-2 bg-surface2 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${stats.progression}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total produits" value={stats.totalProduits} icon="📦" />
        <StatCard label="Saisis" value={stats.saisis} icon="✅" />
        <StatCard label="Avec écart" value={stats.avecEcart} icon="⚠️" />
        <StatCard label="Valeur théorique" value={stats.valeurTheorique} monetary icon="📊" />
        <StatCard label="Valeur physique" value={stats.valeurPhysique ?? 0} monetary icon="💰" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit…"
          className="flex-1 max-w-sm px-4 py-2 bg-surface2 border border-border rounded-lg text-ink placeholder-muted"
        />
        <div className="flex gap-2">
          {[
            { key: 'tous', label: 'Tous' },
            { key: 'saisi', label: 'Saisi' },
            { key: 'non_saisi', label: 'Non saisi' },
            { key: 'ecart', label: 'Avec écart' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer ${
                filter === f.key
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'bg-surface2 text-muted border border-border hover:text-ink'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface2 border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Produit</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Exp.</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase">Stock théo.</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted uppercase">Stock physique</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase">Écart</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase">PUA ($)</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase">Valeur ($)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredLignes.map((ligne) => (
              <tr
                key={ligne.produit_id}
                className={`hover:bg-surface2/50 transition-colors ${getRowBorderClass(ligne)}`}
              >
                <td className="px-4 py-3 font-medium text-ink">{ligne.produit.nom}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{ligne.produit.date_expiration}</td>
                <td className="px-4 py-3 text-right font-mono">{ligne.stock_theorique}</td>
                <td className="px-4 py-3 text-center">
                  {isCloture || !canSaisir() ? (
                    <span className="font-mono">
                      {ligne.stock_physique !== null ? ligne.stock_physique : '—'}
                    </span>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      value={ligne.stock_physique ?? ''}
                      onChange={(e) => updateStockPhysique(ligne.produit_id, e.target.value)}
                      className="w-24 px-2 py-1 bg-surface2 border border-border rounded text-ink font-mono text-center focus:border-accent"
                      placeholder="—"
                    />
                  )}
                </td>
                <td className={`px-4 py-3 text-right font-mono ${
                  ligne.ecart === null ? 'text-muted' :
                  ligne.ecart === 0 ? 'text-success' :
                  ligne.ecart > 0 ? 'text-accent' : 'text-danger'
                }`}>
                  {ligne.ecart !== null ? (ligne.ecart > 0 ? '+' : '') + ligne.ecart : '—'}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gold">
                  {ligne.pua.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gold">
                  {ligne.valeur_physique !== null
                    ? ligne.valeur_physique.toFixed(2)
                    : ligne.valeur_theorique.toFixed(2)}
                </td>
              </tr>
            ))}
            {filteredLignes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  Aucun produit trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
