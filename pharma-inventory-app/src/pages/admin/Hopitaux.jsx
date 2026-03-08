// src/pages/admin/Hopitaux.jsx
import { useState } from 'react';
import { useHopital } from '../../hooks/useHopital.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

const emptyForm = { nom: '', ville: '', pays: 'RDC', code: '', actif: true };

export default function Hopitaux() {
  const { hopitaux, loading, create, update, remove } = useHopital();
  const { addToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (h) => {
    setForm({ nom: h.nom, ville: h.ville, pays: h.pays, code: h.code, actif: h.actif });
    setEditId(h.id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await update(editId, form);
      addToast('Établissement modifié avec succès');
    } else {
      await create(form);
      addToast('Établissement créé avec succès');
    }
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet établissement ?')) {
      await remove(id);
      addToast('Établissement supprimé', 'warn');
    }
  };

  const columns = [
    { header: 'Nom', accessor: 'nom', key: 'nom' },
    { header: 'Code', accessor: 'code', key: 'code', cellClassName: 'font-mono text-muted text-xs' },
    { header: 'Ville', accessor: 'ville', key: 'ville' },
    { header: 'Pays', accessor: 'pays', key: 'pays' },
    {
      header: 'Statut',
      key: 'actif',
      accessor: (row) => row.actif,
      render: (row) => (
        <Badge variant={row.actif ? 'success' : 'danger'}>
          {row.actif ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      sortable: false,
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>Modifier</Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>Supprimer</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Établissements</h1>
        <Button onClick={openCreate}>+ Créer un établissement</Button>
      </div>

      <DataTable
        columns={columns}
        data={hopitaux}
        searchable
        searchPlaceholder="Rechercher un établissement…"
        emptyMessage="Aucun établissement enregistré"
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Modifier l\'établissement' : 'Créer un établissement'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[0.68rem] font-semibold text-muted uppercase tracking-widest mb-2">Nom</label>
            <input
              value={form.nom}
              onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
              required
              className="input-premium w-full"
              placeholder="Dépôt Kinshasa/Masina"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.68rem] font-semibold text-muted uppercase tracking-widest mb-2">Ville</label>
              <input
                value={form.ville}
                onChange={(e) => setForm((f) => ({ ...f, ville: e.target.value }))}
                required
                className="input-premium w-full"
              />
            </div>
            <div>
              <label className="block text-[0.68rem] font-semibold text-muted uppercase tracking-widest mb-2">Pays</label>
              <input
                value={form.pays}
                onChange={(e) => setForm((f) => ({ ...f, pays: e.target.value }))}
                required
                className="input-premium w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-[0.68rem] font-semibold text-muted uppercase tracking-widest mb-2">Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              required
              className="input-premium w-full font-mono"
              placeholder="KIN-001"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.actif}
              onChange={(e) => setForm((f) => ({ ...f, actif: e.target.checked }))}
              className="w-4 h-4 accent-accent"
            />
            <label className="text-sm text-ink">Actif</label>
          </div>
          <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(142,143,247,0.08)' }}>
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">{editId ? 'Enregistrer' : 'Créer'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
