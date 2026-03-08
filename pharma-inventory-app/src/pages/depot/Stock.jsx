// src/pages/depot/Stock.jsx
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import produitsService from '../../services/produitsService.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

const emptyForm = { nom: '', pua: 0 };

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

  const filteredProduits = useMemo(() => {
    let result = produits;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((p) => p.nom.toLowerCase().includes(s));
    }
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
    setForm({ nom: p.nom, pua: p.pua });
    setEditId(p.id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, pua: Number(form.pua) };
    if (editId) {
      await produitsService.updateProduit(editId, data);
      addToast('Produit modifié avec succès');
    } else {
      await produitsService.createProduit({ ...data, stock_theorique: 0, hopital_id: hopitalCode });
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

  const SortIcon = ({ col }) => sortKey === col ? <span className="text-accent">{sortDir === 'asc' ? '↑' : '↓'}</span> : null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Stock des produits</h1>
        {canEdit() && <Button onClick={openCreate}>+ Ajouter un produit</Button>}
      </div>

      {/* Search & filters */}
      <div className="glass-card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit…"
            className="input-premium flex-1 max-w-sm"
          />
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'tous', label: 'Tous' },
              { key: 'en_stock', label: 'En stock' },
              { key: 'rupture', label: 'Rupture' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3.5 py-2 text-sm rounded-full transition-all cursor-pointer font-medium ${
                  filter === f.key ? 'text-white' : 'text-muted hover:text-ink'
                }`}
                style={
                  filter === f.key
                    ? { background: 'linear-gradient(135deg, #8E8FF7, #7B7CF5)', color: '#fff', boxShadow: '0 3px 12px rgba(142,143,247,0.25)' }
                    : { background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(142,143,247,0.10)' }
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table-premium">
          <thead>
            <tr>
              {[
                { key: 'nom', label: 'Produit' },
                { key: 'stock_theorique', label: 'Stock théo.' },
                { key: 'pua', label: 'PUA ($)' },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="text-left cursor-pointer hover:text-accent select-none"
                >
                  <span className="flex items-center gap-1">
                    {col.label} <SortIcon col={col.key} />
                  </span>
                </th>
              ))}
              <th className="text-right">Valeur ($)</th>
              {canEdit() && (
                <th className="text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredProduits.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-ink">{p.nom}</td>
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
            ))}
            {filteredProduits.length === 0 && (
              <tr>
                <td colSpan={canEdit() ? 5 : 4} className="px-4 py-8 text-center text-muted">
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
            <label className="block text-[0.68rem] font-semibold text-muted uppercase tracking-widest mb-2">Nom du produit</label>
            <input
              value={form.nom}
              onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
              required
              className="input-premium w-full"
              placeholder="CEFTRIAXONE INJ 1G"
            />
          </div>
          <div>
            <label className="block text-[0.68rem] font-semibold text-muted uppercase tracking-widest mb-2">PUA ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.pua}
              onChange={(e) => setForm((f) => ({ ...f, pua: e.target.value }))}
              required
              className="input-premium w-full font-mono"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(142,143,247,0.08)' }}>
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button type="submit">{editId ? 'Enregistrer' : 'Ajouter'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
