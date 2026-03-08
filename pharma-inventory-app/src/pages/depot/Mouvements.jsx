// src/pages/depot/Mouvements.jsx
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import mouvementsService from '../../services/mouvementsService.js';
import produitsService from '../../services/produitsService.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

const emptyForm = {
  produit_id: '',
  type: 'entree',
  quantite: '',
  lot_number: '',
  notes: '',
};

export default function Mouvements() {
  const { hopitalCode, user } = useAuth();
  const { addToast } = useToast();
  const [produits, setProduits] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('tous');
  const [filterProduit, setFilterProduit] = useState('');

  const load = async () => {
    if (!hopitalCode) return;
    const [p, m] = await Promise.all([
      produitsService.getProduits(hopitalCode),
      mouvementsService.getMouvements(hopitalCode),
    ]);
    setProduits(p);
    setMouvements(m);
  };

  useEffect(() => { load(); }, [hopitalCode]);

  const handleOpen = (type = 'entree', produitId = '') => {
    setForm({ ...emptyForm, type, produit_id: produitId });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await mouvementsService.saveMouvement({
        hopital_id: hopitalCode,
        produit_id: form.produit_id,
        type: form.type,
        quantite: Number(form.quantite),
        lot_number: form.lot_number,
        notes: form.notes,
        user_id: user?.id,
      });
      addToast(
        `${form.type === 'entree' ? 'Entrée' : 'Sortie'} enregistrée avec succès`,
        'success'
      );
      setModalOpen(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      addToast(err.message || 'Erreur lors de la saisie', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    let result = mouvements;
    if (filterType !== 'tous') result = result.filter((m) => m.type === filterType);
    if (filterProduit) result = result.filter((m) => m.produit_id === filterProduit);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.produit_nom?.toLowerCase().includes(s) ||
          m.lot_number?.toLowerCase().includes(s) ||
          m.notes?.toLowerCase().includes(s)
      );
    }
    return result;
  }, [mouvements, filterType, filterProduit, search]);

  const totalEntrees = filtered.filter((m) => m.type === 'entree').reduce((s, m) => s + m.quantite, 0);
  const totalSorties = filtered.filter((m) => m.type === 'sortie').reduce((s, m) => s + m.quantite, 0);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const selectedProduit = produits.find((p) => p.id === form.produit_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink tracking-wide">
            Mouvements de stock
          </h1>
          <p className="text-muted text-sm mt-1">Enregistrer les entrées et sorties avec numéro de lot</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => handleOpen('sortie')} variant="danger">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sortie
          </Button>
          <Button onClick={() => handleOpen('entree')} variant="primary">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V12m0 0V8m0 4h4m-4 0H3m14 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Entrée
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 border-t-2 border-t-accent">
          <p className="text-xs text-muted uppercase tracking-widest mb-1">Total mouvements</p>
          <p className="font-mono text-3xl font-semibold text-ink">{filtered.length}</p>
        </div>
        <div className="glass-card p-5 border-t-2 border-t-success">
          <p className="text-xs text-muted uppercase tracking-widest mb-1">Total entrées (qté)</p>
          <p className="font-mono text-3xl font-semibold text-success">+{totalEntrees}</p>
        </div>
        <div className="glass-card p-5 border-t-2 border-t-danger">
          <p className="text-xs text-muted uppercase tracking-widest mb-1">Total sorties (qté)</p>
          <p className="font-mono text-3xl font-semibold text-danger">−{totalSorties}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher produit, lot, notes…"
            className="input-premium flex-1"
          />
          <select
            value={filterProduit}
            onChange={(e) => setFilterProduit(e.target.value)}
            className="input-premium min-w-[200px]"
          >
            <option value="">Tous les produits</option>
            {produits.map((p) => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
          <div className="flex gap-2">
            {[
              { key: 'tous', label: 'Tous' },
              { key: 'entree', label: 'Entrées' },
              { key: 'sortie', label: 'Sorties' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key)}
                className={`px-3 py-2 text-sm rounded-lg transition-all cursor-pointer border ${
                  filterType === f.key
                    ? f.key === 'entree'
                      ? 'bg-success/20 text-success border-success/30'
                      : f.key === 'sortie'
                      ? 'bg-danger/20 text-danger border-danger/30'
                      : 'bg-accent/20 text-accent border-accent/30'
                    : 'bg-surface2 text-muted border-border hover:text-ink'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Movements table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider">Date & heure</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider">Type</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider">Produit</th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold text-muted uppercase tracking-wider">N° Lot</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted uppercase tracking-wider">Qté</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted uppercase tracking-wider">Avant</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted uppercase tracking-wider">Après</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 py-3 font-mono text-xs text-muted whitespace-nowrap">
                    {formatDate(m.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {m.type === 'entree' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/15 text-success border border-success/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                        Entrée
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-danger/15 text-danger border border-danger/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
                        Sortie
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink max-w-[200px] truncate">
                    {m.produit_nom}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {m.lot_number ? (
                      <span className="font-mono text-xs px-2 py-0.5 bg-surface2 border border-border rounded text-accent">
                        {m.lot_number}
                      </span>
                    ) : (
                      <span className="text-muted text-xs">—</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold text-base ${
                    m.type === 'entree' ? 'text-success' : 'text-danger'
                  }`}>
                    {m.type === 'entree' ? '+' : '−'}{m.quantite}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-muted text-xs">{m.stock_avant}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-xs text-ink">{m.stock_apres}</td>
                  <td className="px-4 py-3 text-muted text-xs max-w-[160px] truncate">
                    {m.notes || '—'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted">
                      <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-sm">Aucun mouvement enregistré</p>
                      <p className="text-xs opacity-60">Utilisez les boutons Entrée / Sortie pour commencer</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.type === 'entree' ? '📥 Enregistrer une entrée' : '📤 Enregistrer une sortie'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type toggle */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Type de mouvement
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: 'entree' }))}
                className={`py-3 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${
                  form.type === 'entree'
                    ? 'bg-success/20 text-success border-success/40 shadow-[0_0_12px_rgba(52,211,153,0.15)]'
                    : 'bg-surface2 text-muted border-border hover:border-success/30'
                }`}
              >
                📥 Entrée
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: 'sortie' }))}
                className={`py-3 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${
                  form.type === 'sortie'
                    ? 'bg-danger/20 text-danger border-danger/40 shadow-[0_0_12px_rgba(251,113,133,0.15)]'
                    : 'bg-surface2 text-muted border-border hover:border-danger/30'
                }`}
              >
                📤 Sortie
              </button>
            </div>
          </div>

          {/* Product */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Produit <span className="text-danger">*</span>
            </label>
            <select
              value={form.produit_id}
              onChange={(e) => setForm((f) => ({ ...f, produit_id: e.target.value }))}
              required
              className="input-premium w-full"
            >
              <option value="">— Sélectionner un produit —</option>
              {produits.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom} (stock: {p.stock_theorique})
                </option>
              ))}
            </select>
            {selectedProduit && (
              <p className="mt-1.5 text-xs text-muted">
                Stock actuel :
                <span className={`ml-1 font-mono font-semibold ${selectedProduit.stock_theorique === 0 ? 'text-danger' : 'text-accent'}`}>
                  {selectedProduit.stock_theorique}
                </span>
                {' · '}Exp. <span className="font-mono text-warn">{selectedProduit.date_expiration}</span>
              </p>
            )}
          </div>

          {/* Quantity + Lot */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Quantité <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.quantite}
                onChange={(e) => setForm((f) => ({ ...f, quantite: e.target.value }))}
                required
                className="input-premium w-full font-mono text-lg"
                placeholder="0"
              />
              {selectedProduit && form.quantite && form.type === 'sortie' && (
                <p className="mt-1 text-xs text-muted">
                  Après sortie :
                  <span className={`ml-1 font-mono font-semibold ${
                    selectedProduit.stock_theorique - Number(form.quantite) < 0 ? 'text-danger' : 'text-success'
                  }`}>
                    {selectedProduit.stock_theorique - Number(form.quantite)}
                  </span>
                </p>
              )}
              {selectedProduit && form.quantite && form.type === 'entree' && (
                <p className="mt-1 text-xs text-muted">
                  Après entrée :
                  <span className="ml-1 font-mono font-semibold text-success">
                    {selectedProduit.stock_theorique + Number(form.quantite)}
                  </span>
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                N° de lot
              </label>
              <input
                type="text"
                value={form.lot_number}
                onChange={(e) => setForm((f) => ({ ...f, lot_number: e.target.value }))}
                className="input-premium w-full font-mono uppercase"
                placeholder="EX: LOT2024-A"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Notes / motif
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="input-premium w-full resize-none"
              placeholder="Motif de la sortie, fournisseur, bon de livraison…"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              variant={form.type === 'entree' ? 'primary' : 'danger'}
            >
              {submitting ? 'Enregistrement…' : form.type === 'entree' ? '📥 Confirmer l\'entrée' : '📤 Confirmer la sortie'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
