// src/pages/depot/Rapport.jsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useAuth } from '../../hooks/useAuth.jsx';
import inventaireService from '../../services/inventaireService.js';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

export default function Rapport() {
  const { hopitalCode, hopital } = useAuth();
  const { addToast } = useToast();
  const [inventaires, setInventaires] = useState([]);
  const [selectedMois, setSelectedMois] = useState('');
  const [lignes, setLignes] = useState([]);
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    if (!hopitalCode) return;
    const load = async () => {
      const all = await inventaireService.getInventaires(hopitalCode);
      const closed = all.filter((i) => i.statut === 'cloture');
      setInventaires(closed);
      if (closed.length > 0) setSelectedMois(closed[0].mois);
    };
    load();
  }, [hopitalCode]);

  useEffect(() => {
    if (!selectedMois || !hopitalCode) return;
    const load = async () => {
      setLoading(true);
      const data = await inventaireService.getLignesAvecProduits(hopitalCode, selectedMois);
      setLignes(data);
      setLoading(false);
    };
    load();
  }, [selectedMois, hopitalCode]);

  const handlePrint = useReactToPrint({ contentRef: printRef });

  const formatMois = (mois) => {
    const [y, m] = mois.split('-');
    const months = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return `${months[parseInt(m)]} ${y}`;
  };

  const totals = useMemo(() => {
    const valTheo = lignes.reduce((s, l) => s + (l.valeur_theorique || 0), 0);
    const valPhys = lignes
      .filter((l) => l.stock_physique !== null)
      .reduce((s, l) => s + (l.valeur_physique || 0), 0);
    const ecarts = lignes.filter((l) => l.ecart !== null && l.ecart !== 0).length;
    return { valTheo, valPhys, ecartTotal: valPhys - valTheo, ecarts };
  }, [lignes]);

  const exportCSV = () => {
    const headers = ['Produit', 'Date Exp.', 'Stock Théorique', 'Stock Physique', 'Écart', 'PUA ($)', 'Valeur Théo. ($)', 'Valeur Phys. ($)'];
    const rows = lignes.map((l) => [
      l.produit?.nom,
      l.produit?.date_expiration,
      l.stock_theorique,
      l.stock_physique ?? '',
      l.ecart ?? '',
      l.pua?.toFixed(2),
      l.valeur_theorique?.toFixed(2),
      l.valeur_physique?.toFixed(2) ?? '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-inventaire-${selectedMois}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Fichier CSV exporté avec succès', 'success');
  };

  if (inventaires.length === 0) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-ink mb-6">Rapport d'inventaire</h1>
        <div className="glass-card p-8 text-center text-muted">
          Aucun inventaire clôturé disponible pour générer un rapport.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Rapport d'inventaire</h1>
        <div className="flex items-center gap-3">
          <select
            value={selectedMois}
            onChange={(e) => setSelectedMois(e.target.value)}
            className="input-premium px-3 py-2 text-sm"
          >
            {inventaires.map((inv) => (
              <option key={inv.id} value={inv.mois}>
                {formatMois(inv.mois)}
              </option>
            ))}
          </select>
          <Button onClick={exportCSV} variant="secondary" size="sm">
            📄 Exporter CSV
          </Button>
          <Button onClick={handlePrint} size="sm">
            🖨️ Imprimer PDF
          </Button>
        </div>
      </div>

      {/* Printable report */}
      <div
        ref={printRef}
        className="bg-white text-gray-900 rounded-lg p-6 print:p-0 print:shadow-none"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Report header */}
        <div className="text-center mb-6 border-b-2 border-gray-300 pb-4">
          <h2 className="text-xl font-bold uppercase">{hopital?.nom || 'Dépôt Pharmaceutique'}</h2>
          <p className="text-sm text-gray-600">{hopital?.ville}, {hopital?.pays}</p>
          <h3 className="text-lg font-semibold mt-2">
            RAPPORT D'INVENTAIRE PHYSIQUE
          </h3>
          <p className="text-sm text-gray-500">Période : {formatMois(selectedMois)}</p>
          <p className="text-xs text-gray-400 mt-1">
            Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-3 mb-6 text-center text-sm">
          <div className="border border-gray-200 rounded p-3">
            <p className="text-gray-500">Total produits</p>
            <p className="text-lg font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{lignes.length}</p>
          </div>
          <div className="border border-gray-200 rounded p-3">
            <p className="text-gray-500">Valeur théorique</p>
            <p className="text-lg font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>${totals.valTheo.toFixed(2)}</p>
          </div>
          <div className="border border-gray-200 rounded p-3">
            <p className="text-gray-500">Valeur physique</p>
            <p className="text-lg font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>${totals.valPhys.toFixed(2)}</p>
          </div>
          <div className="border border-gray-200 rounded p-3">
            <p className="text-gray-500">Écart global</p>
            <p className={`text-lg font-bold ${totals.ecartTotal < 0 ? 'text-red-600' : 'text-green-600'}`}
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              ${totals.ecartTotal.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-1.5 text-left">N°</th>
              <th className="border border-gray-300 p-1.5 text-left">Désignation</th>
              <th className="border border-gray-300 p-1.5 text-center">Date Exp.</th>
              <th className="border border-gray-300 p-1.5 text-right">Stock Théo.</th>
              <th className="border border-gray-300 p-1.5 text-right">Stock Phys.</th>
              <th className="border border-gray-300 p-1.5 text-right">Écart</th>
              <th className="border border-gray-300 p-1.5 text-right">PUA ($)</th>
              <th className="border border-gray-300 p-1.5 text-right">Val. Théo. ($)</th>
              <th className="border border-gray-300 p-1.5 text-right">Val. Phys. ($)</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((l, i) => (
              <tr key={l.produit_id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 p-1.5 text-center"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{i + 1}</td>
                <td className="border border-gray-300 p-1.5">{l.produit?.nom}</td>
                <td className="border border-gray-300 p-1.5 text-center"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{l.produit?.date_expiration}</td>
                <td className="border border-gray-300 p-1.5 text-right"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{l.stock_theorique}</td>
                <td className="border border-gray-300 p-1.5 text-right"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  {l.stock_physique ?? '—'}
                </td>
                <td className={`border border-gray-300 p-1.5 text-right font-semibold ${
                  l.ecart != null && l.ecart < 0 ? 'text-red-600' : l.ecart > 0 ? 'text-green-600' : ''
                }`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  {l.ecart != null ? (l.ecart > 0 ? '+' : '') + l.ecart : '—'}
                </td>
                <td className="border border-gray-300 p-1.5 text-right"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{l.pua?.toFixed(2)}</td>
                <td className="border border-gray-300 p-1.5 text-right"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{l.valeur_theorique?.toFixed(2)}</td>
                <td className="border border-gray-300 p-1.5 text-right"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  {l.valeur_physique != null ? l.valeur_physique.toFixed(2) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td colSpan={7} className="border border-gray-300 p-1.5 text-right">TOTAUX</td>
              <td className="border border-gray-300 p-1.5 text-right"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}>${totals.valTheo.toFixed(2)}</td>
              <td className="border border-gray-300 p-1.5 text-right"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}>${totals.valPhys.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Signatures */}
        <div className="mt-10 grid grid-cols-3 gap-8 text-center text-sm">
          <div>
            <p className="font-semibold mb-12">Le Responsable</p>
            <div className="border-t border-gray-400 pt-2">
              <p className="text-gray-500">Nom et signature</p>
            </div>
          </div>
          <div>
            <p className="font-semibold mb-12">Le Directeur</p>
            <div className="border-t border-gray-400 pt-2">
              <p className="text-gray-500">Nom et signature</p>
            </div>
          </div>
          <div>
            <p className="font-semibold mb-12">Le Pharmacien</p>
            <div className="border-t border-gray-400 pt-2">
              <p className="text-gray-500">Nom et signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
