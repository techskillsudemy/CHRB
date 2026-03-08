// src/pages/admin/Utilisateurs.jsx
import { useState, useEffect } from 'react';
import usersService from '../../services/usersService.js';
import hopitauxService from '../../services/hopitauxService.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

const emptyForm = { email: '', nom: '', password: '', role: 'agent', hopital_code: '' };
const roles = [
  { value: 'super_admin', label: 'Super Administrateur' },
  { value: 'responsable', label: 'Responsable' },
  { value: 'directeur', label: 'Directeur' },
  { value: 'agent', label: 'Agent de Saisie' },
];

export default function Utilisateurs() {
  const [users, setUsers] = useState([]);
  const [hopitaux, setHopitaux] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const { addToast } = useToast();

  const load = async () => {
    const u = await usersService.getUsers();
    const h = await hopitauxService.getHopitaux();
    setUsers(u);
    setHopitaux(h);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };

  const openEdit = (u) => {
    setForm({ email: u.email, nom: u.nom, password: '', role: '', hopital_code: u.hopital_code || '' });
    // Find role from profiles
    const profiles = JSON.parse(localStorage.getItem('depot_profiles') || '[]');
    const profile = profiles.find((p) => p.user_id === u.id);
    setForm((f) => ({ ...f, role: profile?.role || 'agent' }));
    setEditId(u.id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      const updates = { email: form.email, nom: form.nom, hopital_code: form.hopital_code || null };
      if (form.password) updates.password = form.password;
      if (form.role) updates.role = form.role;
      await usersService.updateUser(editId, updates);
      addToast('Utilisateur modifié avec succès');
    } else {
      await usersService.createUser(form);
      addToast('Utilisateur créé avec succès');
    }
    setModalOpen(false);
    load();
  };

  const handleToggle = async (id) => {
    await usersService.toggleUserActif(id);
    addToast('Statut modifié');
    load();
  };

  const roleLabel = (userId) => {
    const profiles = JSON.parse(localStorage.getItem('depot_profiles') || '[]');
    const p = profiles.find((pr) => pr.user_id === userId);
    return roles.find((r) => r.value === p?.role)?.label || p?.role || '—';
  };

  const columns = [
    { header: 'Nom', accessor: 'nom', key: 'nom' },
    { header: 'Email', accessor: 'email', key: 'email', cellClassName: 'font-mono text-xs text-muted' },
    {
      header: 'Rôle', key: 'role', accessor: (row) => roleLabel(row.id),
      render: (row) => <span className="text-accent text-xs font-medium">{roleLabel(row.id)}</span>,
    },
    { header: 'Établissement', accessor: 'hopital_code', key: 'hopital_code', cellClassName: 'font-mono text-xs' },
    {
      header: 'Statut', key: 'actif', accessor: (row) => row.actif,
      render: (row) => (
        <Badge variant={row.actif ? 'success' : 'danger'}>
          {row.actif ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
    {
      header: 'Actions', key: 'actions', sortable: false,
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>Modifier</Button>
          <Button size="sm" variant={row.actif ? 'danger' : 'gold'} onClick={() => handleToggle(row.id)}>
            {row.actif ? 'Désactiver' : 'Activer'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Utilisateurs</h1>
        <Button onClick={openCreate}>+ Créer un utilisateur</Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchable
        searchPlaceholder="Rechercher un utilisateur…"
        emptyMessage="Aucun utilisateur enregistré"
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[0.68rem] font-semibold text-muted uppercase tracking-widest mb-2">Nom complet</label>
            <input
              value={form.nom}
              onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
              required
              className="input-premium w-full"
            />
          </div>
          <div>
            <label className="block text-[0.68rem] font-semibold text-muted uppercase tracking-widest mb-2">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              className="input-premium w-full font-mono"
            />
          </div>
          <div>
            <label className="block text-[0.68rem] font-semibold text-muted uppercase tracking-widest mb-2">
              {editId ? 'Nouveau mot de passe (laisser vide pour garder)' : 'Mot de passe'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required={!editId}
              className="input-premium w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.68rem] font-semibold text-muted uppercase tracking-widest mb-2">Rôle</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="input-premium w-full"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[0.68rem] font-semibold text-muted uppercase tracking-widest mb-2">Établissement</label>
              <select
                value={form.hopital_code}
                onChange={(e) => setForm((f) => ({ ...f, hopital_code: e.target.value }))}
                className="input-premium w-full"
              >
                <option value="">— Aucun —</option>
                {hopitaux.map((h) => (
                  <option key={h.id} value={h.code}>{h.nom} ({h.code})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(142,143,247,0.08)' }}>
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button type="submit">{editId ? 'Enregistrer' : 'Créer'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
