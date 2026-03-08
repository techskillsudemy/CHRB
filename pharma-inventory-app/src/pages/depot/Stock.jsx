// src/pages/depot/Stock.jsx
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import produitsService from '../../services/produitsService.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

const emptyForm = { nom: '', date_expiration: '', stock_theorique: 0, pua: 0 };

export default function Stock() {
  const { hopitalCode, canEdit } = useAuth();
  const { addToast } = useToast();
  const [produits, setProduits] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('tous');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [sortKey, setSortKey] = useState('nom');
  const [sortDir, setSortDir] = useState('asc');

  const load = async () => {
    if (!hopitalCode) return;
    const data = await produitsService.getProduits(hopitalCode);
    setProduits(data);
  };

  useEffect(() => { load(); }, [hopitalCode]);

  const now = new Date();
  const threeMonths = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());

  const getStatus = (p) => {
    const exp = new Date(p.date_expiration);
    if (exp < now) return 'expired';
    if (exp <= threeMonths) return 'expiring';
    return 'ok';
  };

  const filteredProduits = useMemo(() => {
    let result = produits;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((p) => p.nom.toLowerCase().includes(s));
    }
    if (filter === 'expires') result = result.filter((p) => getStatus(p) === 'expired');
    if (filter === 'expiring') result = result.filter((p) => getStatus(p) === 'expiring');
    if (filter === 'en_stock') result = result.filter((p) => p.stock_theorique > 0);
    if (filter === 'rupture') result = result.filter((p) => p.stock_theorique === 0);

    result = [...result].sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [produits, search, filter, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const openCreate = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (p) => {
    setForm({ nom: p.nom, date_expiration: p.date_expiration, stock_theorique: p.stock_theorique, pua: p.pua });
    setEditId(p.id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, stock_theorique: Number(form.stock_theorique), pua: Number(form.pua) };
    if (editId) {
      await produitsService.updateProduit(editId, data);
      addToast('Produit modifié avec succès');
    } else {
      await produitsService.createProduit({ ...data, hopital_id: hopitalCode });
      addToast('Produit ajouté avec succès');
    }
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    await produitsService.deleteProduit(id);
    addToast('Produit supprimé', 'warn');
    load();
  };

  const expiredCount = produits.filter((p) => getStatus(p) === 'expired').length;
  const expiringCount = produits.filter((p) => getStatus(p) === 'expiring').length;

  const SortIcon = ({ col }) => sortKey === col ? <span className="text-accent">{sortDir === 'asc' ? '↑' : '↓'}</span> : null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Stock des produits</h1>
        {canEdit() && <Button onClick={openCreate}>+ Ajouter un produit</Button>}
      </div>

      {/* Alert banner */}
      {(expiredCount > 0 || expiringCount > 0) && (
        <div className="mb-4 px-4 py-3 bg-danger/10 border border-danger/30 rounded-lg flex items-center gap-3">
          <span className="text-danger text-lg">⚠</span>
          <span className="text-sm text-danger">
            {expiredCount > 0 && `${expiredCount} produit(s) expiré(s)`}
            {expiredCount > 0 && expiringCount > 0 && ' — '}
            {expiringCount > 0 && `${expiringCount} produit(s) expirant bientôt`}
          </span>
        </div>
      )}

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit…"
          className="flex-1 max-w-sm px-4 py-2 bg-surface2 border border-border rounded-lg text-ink placeholder-muted"
        />
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'tous', label: 'Tous' },
            { key: 'en_stock', label: 'En stock' },
            { key: 'rupture', label: 'Rupture' },
            { key: 'expiring', label: 'Expirant' },
            { key: 'expires', label: 'Expirés' },
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
              {[
                { key: 'nom', label: 'Produit' },
                { key: 'date_expiration', label: 'Expiration' },
                { key: 'stock_theorique', label: 'Stock théo.' },
                { key: 'pua', label: 'PUA ($)' },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase cursor-pointer hover:text-accent select-none"
                >
                  <span className="flex items-center gap-1">
                    {col.label} <SortIcon col={col.key} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase">Valeur ($)</th>
              {canEdit() && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredProduits.map((p) => {
              const status = getStatus(p);
              const borderCls = status === 'expired' ? 'border-l-3 border-l-danger' :
                               status === 'expiring' ? 'border-l-3 border-l-warn' : '';
              return (
                <tr key={p.id} className={`hover:bg-surface2/50 transition-colors ${borderCls}`}>
                  <td className="px-4 py-3 font-medium text-ink">{p.nom}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <span className={status === 'expired' ? 'text-danger' : status === 'expiring' ? 'text-warn' : 'text-muted'}>
                      {p.date_expiration}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {p.stock_theorique === 0 ? (
                      <span className="text-danger">0</span>
                    ) : p.stock_theorique}
                  </td>
                  <td className="px-4 py-3 font-mono text-gold">{p.pua.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono text-gold">
                    {(p.stock_theorique * p.pua).toFixed(2)}
                  </td>
                  {canEdit() && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>Modifier</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(p.id)}>Supprimer</Button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
            {filteredProduits.length === 0 && (
              <tr>
                <td colSpan={canEdit() ? 6 : 5} className="px-4 py-8 text-center text-muted">
                  Aucun produit trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Modifier le produit' : 'Ajouter un produit'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Nom du produit</label>
            <input
              value={form.nom}
              onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
              required
              className="w-full px-4 py-2 bg-surface2 border border-border rounded-lg text-ink"
              placeholder="CEFTRIAXONE INJ 1G"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Date expiration</label>
              <input
                type="month"
                value={form.date_expiration}
                onChange={(e) => setForm((f) => ({ ...f, date_expiration: e.target.value }))}
                required
                className="w-full px-4 py-2 bg-surface2 border border-border rounded-lg text-ink font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Stock théorique</label>
              <input
                type="number"
                min="0"
                value={form.stock_theorique}
                onChange={(e) => setForm((f) => ({ ...f, stock_theorique: e.target.value }))}
                required
                className="w-full px-4 py-2 bg-surface2 border border-border rounded-lg text-ink font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">PUA ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.pua}
                onChange={(e) => setForm((f) => ({ ...f, pua: e.target.value }))}
                required
                className="w-full px-4 py-2 bg-surface2 border border-border rounded-lg text-ink font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button type="submit">{editId ? 'Enregistrer' : 'Ajouter'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
