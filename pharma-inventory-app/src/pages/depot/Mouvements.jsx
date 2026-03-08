// src/pages/depot/Mouvements.jsx
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import mouvementsService from '../../services/mouvementsService.js';
import produitsService from '../../services/produitsService.js';
import lotsService from '../../services/lotsService.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

const emptyEntreeForm = {
  produit_id: '',
  quantite: '',
  lot_number: '',
  date_expiration: '',
  notes: '',
};

const emptySortieForm = {
  produit_id: '',
  lot_id: '',
  quantite: '',
  notes: '',
};

export default function Mouvements() {
  const { hopitalCode, user } = useAuth();
  const { addToast } = useToast();
  const [produits, setProduits] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [modalType, setModalType] = useState(null); // 'entree' | 'sortie' | null
  const [entreeForm, setEntreeForm] = useState(emptyEntreeForm);
  const [sortieForm, setSortieForm] = useState(emptySortieForm);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('tous');
  const [filterProduit, setFilterProduit] = useState('');

  // Lots for the selected product (sortie mode)
  const [availableLots, setAvailableLots] = useState([]);

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

  // When product changes in sortie form, load its lots
  useEffect(() => {
    if (modalType === 'sortie' && sortieForm.produit_id && hopitalCode) {
      const lots = lotsService.getLots(hopitalCode, sortieForm.produit_id);
      setAvailableLots(lots);
    } else {
      setAvailableLots([]);
    }
  }, [sortieForm.produit_id, modalType, hopitalCode]);

  const handleOpenEntree = (produitId = '') => {
    setEntreeForm({ ...emptyEntreeForm, produit_id: produitId });
    setModalType('entree');
  };

  const handleOpenSortie = (produitId = '') => {
    setSortieForm({ ...emptySortieForm, produit_id: produitId });
    setModalType('sortie');
  };

  const handleSubmitEntree = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await mouvementsService.saveEntree({
        hopital_id: hopitalCode,
        produit_id: entreeForm.produit_id,
        quantite: Number(entreeForm.quantite),
        lot_number: entreeForm.lot_number,
        date_expiration: entreeForm.date_expiration,
        notes: entreeForm.notes,
        user_id: user?.id,
      });
      addToast('Entrée enregistrée avec succès', 'success');
      setModalType(null);
      setEntreeForm(emptyEntreeForm);
      await load();
    } catch (err) {
      addToast(err.message || 'Erreur lors de la saisie', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitSortie = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await mouvementsService.saveSortie({
        hopital_id: hopitalCode,
        produit_id: sortieForm.produit_id,
        quantite: Number(sortieForm.quantite),
        lot_id: sortieForm.lot_id,
        notes: sortieForm.notes,
        user_id: user?.id,
      });
      addToast('Sortie enregistrée avec succès', 'success');
      setModalType(null);
      setSortieForm(emptySortieForm);
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

  const selectedProduitEntree = produits.find((p) => p.id === entreeForm.produit_id);
  const selectedProduitSortie = produits.find((p) => p.id === sortieForm.produit_id);
  const selectedLot = availableLots.find((l) => l.id === sortieForm.lot_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink tracking-tight">
            Mouvements de stock
          </h1>
          <p className="text-muted text-sm mt-1">Entrées et sorties par lot — traçabilité complète</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => handleOpenSortie()} variant="danger">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Sortie
          </Button>
          <Button onClick={() => handleOpenEntree()} variant="primary">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Entrée
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-[0.68rem] text-muted uppercase tracking-widest font-semibold mb-1">Total mouvements</p>
          <p className="font-display text-[1.65rem] font-bold text-ink">{filtered.length}</p>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid var(--color-success)' }}>
          <p className="text-[0.68rem] text-muted uppercase tracking-widest font-semibold mb-1">Total entrées (qté)</p>
          <p className="font-display text-[1.65rem] font-bold text-success">+{totalEntrees}</p>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid var(--color-danger)' }}>
          <p className="text-[0.68rem] text-muted uppercase tracking-widest font-semibold mb-1">Total sorties (qté)</p>
          <p className="font-display text-[1.65rem] font-bold text-danger">−{totalSorties}</p>
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
                className={`px-3.5 py-2 text-sm rounded-full transition-all cursor-pointer font-medium ${
                  filterType === f.key ? 'text-white' : 'text-muted hover:text-ink'
                }`}
                style={
                  filterType === f.key
                    ? f.key === 'entree'
                      ? { background: 'linear-gradient(135deg, #6DD4A0, #4BC088)', color: '#fff', boxShadow: '0 3px 12px rgba(109,212,160,0.25)' }
                      : f.key === 'sortie'
                      ? { background: 'linear-gradient(135deg, #F28B8B, #E66B6B)', color: '#fff', boxShadow: '0 3px 12px rgba(242,139,139,0.25)' }
                      : { background: 'linear-gradient(135deg, #8E8FF7, #7B7CF5)', color: '#fff', boxShadow: '0 3px 12px rgba(142,143,247,0.25)' }
                    : { background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(142,143,247,0.10)' }
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Movements table */}
      <div className="overflow-x-auto">
        <table className="table-premium">
          <thead>
            <tr>
              <th className="text-left">Date & heure</th>
              <th className="text-left">Type</th>
              <th className="text-left">Produit</th>
              <th className="text-center">N° Lot</th>
              <th className="text-center">Exp. Lot</th>
              <th className="text-right">Qté</th>
              <th className="text-right">Avant</th>
              <th className="text-right">Après</th>
              <th className="text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td className="font-mono text-xs text-muted whitespace-nowrap">
                  {formatDate(m.created_at)}
                </td>
                <td>
                  {m.type === 'entree' ? (
                    <span className="badge badge-success">
                      <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                      Entrée
                    </span>
                  ) : (
                    <span className="badge badge-danger">
                      <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
                      Sortie
                    </span>
                  )}
                </td>
                <td className="font-medium text-ink max-w-[200px] truncate">
                  {m.produit_nom}
                </td>
                <td className="text-center">
                  {m.lot_number ? (
                    <span className="font-mono text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(142,143,247,0.08)', color: '#6C6DF0', border: '1px solid rgba(142,143,247,0.15)' }}>
                      {m.lot_number}
                    </span>
                  ) : (
                    <span className="text-muted text-xs">—</span>
                  )}
                </td>
                <td className="text-center font-mono text-xs text-muted">
                  {m.date_expiration || '—'}
                </td>
                <td className={`text-right font-mono font-semibold text-base ${
                  m.type === 'entree' ? 'text-success' : 'text-danger'
                }`}>
                  {m.type === 'entree' ? '+' : '−'}{m.quantite}
                </td>
                <td className="text-right font-mono text-muted text-xs">{m.stock_avant}</td>
                <td className="text-right font-mono font-semibold text-xs text-ink">{m.stock_apres}</td>
                <td className="text-muted text-xs max-w-[160px] truncate">
                  {m.notes || '—'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-16 text-center">
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

      {/* ═══════════ ENTRÉE MODAL ═══════════ */}
      <Modal
        isOpen={modalType === 'entree'}
        onClose={() => setModalType(null)}
        title="Enregistrer une entrée"
      >
        <form onSubmit={handleSubmitEntree} className="space-y-5">
          {/* Product */}
          <div>
            <label className="block text-[0.68rem] font-semibold text-muted uppercase tracking-widest mb-2">
              Produit <span className="text-danger">*</span>
            </label>
            <select
              value={entreeForm.produit_id}
              onChange={(e) => setEntreeForm((f) => ({ ...f, produit_id: e.target.value }))}
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
            {selectedProduitEntree && (
              <p className="mt-1.5 text-xs text-muted">
                Stock actuel :
                <span className={`ml-1 font-mono font-semibold ${selectedProduitEntree.stock_theorique === 0 ? 'text-danger' : 'text-accent'}`}>
                  {selectedProduitEntree.stock_theorique}
                </span>
              </p>
            )}
          </div>

          {/* Lot number + Expiration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.68rem] font-semibold text-muted uppercase tracking-widest mb-2">
                N° de lot <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={entreeForm.lot_number}
                onChange={(e) => setEntreeForm((f) => ({ ...f, lot_number: e.target.value }))}
                required
                className="input-premium w-full font-mono uppercase"
                placeholder="EX: LOT2024-A"
              />
            </div>
            <div>
              <label className="block text-[0.68rem] font-semibold text-muted uppercase tracking-widest mb-2">
                Expiration du lot
              </label>
              <input
                type="date"
                value={entreeForm.date_expiration}
                onChange={(e) => setEntreeForm((f) => ({ ...f, date_expiration: e.target.value }))}
                className="input-premium w-full font-mono"
              />
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-[0.68rem] font-semibold text-muted uppercase tracking-widest mb-2">
              Quantité <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={entreeForm.quantite}
              onChange={(e) => setEntreeForm((f) => ({ ...f, quantite: e.target.value }))}
              required
              className="input-premium w-full font-mono text-lg"
              placeholder="0"
            />
            {selectedProduitEntree && entreeForm.quantite && (
              <p className="mt-1 text-xs text-muted">
                Après entrée :
                <span className="ml-1 font-mono font-semibold text-success">
                  {selectedProduitEntree.stock_theorique + Number(entreeForm.quantite)}
                </span>
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[0.68rem] font-semibold text-muted uppercase tracking-widest mb-2">
              Notes / motif
            </label>
            <textarea
              value={entreeForm.notes}
              onChange={(e) => setEntreeForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="input-premium w-full resize-none"
              placeholder="Fournisseur, bon de livraison…"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(142,143,247,0.08)' }}>
            <Button variant="secondary" type="button" onClick={() => setModalType(null)}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting} variant="primary">
              {submitting ? 'Enregistrement…' : 'Confirmer l\'entrée'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ═══════════ SORTIE MODAL ═══════════ */}
      <Modal
        isOpen={modalType === 'sortie'}
        onClose={() => setModalType(null)}
        title="Enregistrer une sortie"
      >
        <form onSubmit={handleSubmitSortie} className="space-y-5">
          {/* Product */}
          <div>
            <label className="block text-[0.68rem] font-semibold text-muted uppercase tracking-widest mb-2">
              Produit <span className="text-danger">*</span>
            </label>
            <select
              value={sortieForm.produit_id}
              onChange={(e) => setSortieForm((f) => ({ ...f, produit_id: e.target.value, lot_id: '', quantite: '' }))}
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
            {selectedProduitSortie && (
              <p className="mt-1.5 text-xs text-muted">
                Stock actuel :
                <span className={`ml-1 font-mono font-semibold ${selectedProduitSortie.stock_theorique === 0 ? 'text-danger' : 'text-accent'}`}>
                  {selectedProduitSortie.stock_theorique}
                </span>
              </p>
            )}
          </div>

          {/* Lot picker */}
          <div>
            <label className="block text-[0.68rem] font-semibold text-muted uppercase tracking-widest mb-2">
              Sélectionner le lot <span className="text-danger">*</span>
            </label>
            {availableLots.length === 0 && sortieForm.produit_id ? (
              <div className="px-4 py-3 rounded-2xl text-sm text-center text-muted" style={{ background: 'rgba(242,139,139,0.08)', border: '1px solid rgba(242,139,139,0.15)' }}>
                Aucun lot disponible pour ce produit
              </div>
            ) : (
              <div className="space-y-2">
                {availableLots.map((lot) => {
                  const isSelected = sortieForm.lot_id === lot.id;
                  const isExpired = lot.date_expiration && new Date(lot.date_expiration) < new Date();
                  return (
                    <button
                      key={lot.id}
                      type="button"
                      onClick={() => setSortieForm((f) => ({ ...f, lot_id: lot.id }))}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all cursor-pointer ${
                        isSelected ? 'text-white' : 'text-ink'
                      }`}
                      style={isSelected
                        ? { background: 'linear-gradient(135deg, #8E8FF7, #7B7CF5)', boxShadow: '0 4px 16px rgba(142,143,247,0.25)', border: '1px solid transparent' }
                        : { background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(142,143,247,0.10)' }
                      }
                    >
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-sm font-semibold ${isSelected ? 'text-white' : 'text-accent'}`}>
                          {lot.lot_number}
                        </span>
                        {lot.date_expiration && (
                          <span className={`text-xs font-mono ${isSelected ? 'text-white/80' : isExpired ? 'text-danger' : 'text-muted'}`}>
                            Exp: {lot.date_expiration}
                          </span>
                        )}
                      </div>
                      <span className={`font-mono font-semibold ${isSelected ? 'text-white' : 'text-ink'}`}>
                        {lot.quantite} unités
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quantity */}
          {sortieForm.lot_id && (
            <div>
              <label className="block text-[0.68rem] font-semibold text-muted uppercase tracking-widest mb-2">
                Quantité à sortir <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={selectedLot?.quantite || undefined}
                value={sortieForm.quantite}
                onChange={(e) => setSortieForm((f) => ({ ...f, quantite: e.target.value }))}
                required
                className="input-premium w-full font-mono text-lg"
                placeholder="0"
              />
              {selectedLot && (
                <p className="mt-1 text-xs text-muted">
                  Disponible dans ce lot :
                  <span className="ml-1 font-mono font-semibold text-accent">{selectedLot.quantite}</span>
                  {sortieForm.quantite && (
                    <>
                      {' · '}Restant :
                      <span className={`ml-1 font-mono font-semibold ${
                        selectedLot.quantite - Number(sortieForm.quantite) < 0 ? 'text-danger' : 'text-success'
                      }`}>
                        {selectedLot.quantite - Number(sortieForm.quantite)}
                      </span>
                    </>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[0.68rem] font-semibold text-muted uppercase tracking-widest mb-2">
              Notes / motif
            </label>
            <textarea
              value={sortieForm.notes}
              onChange={(e) => setSortieForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="input-premium w-full resize-none"
              placeholder="Motif de la sortie, service demandeur…"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(142,143,247,0.08)' }}>
            <Button variant="secondary" type="button" onClick={() => setModalType(null)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={submitting || !sortieForm.lot_id}
              variant="danger"
            >
              {submitting ? 'Enregistrement…' : 'Confirmer la sortie'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
