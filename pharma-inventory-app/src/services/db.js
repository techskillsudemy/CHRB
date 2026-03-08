// src/services/db.js
// Phase 1: localStorage adapter
// Phase 2: Replace with Supabase client import

const KEYS = {
  hopitaux: 'depot_hopitaux',
  users: 'depot_users',
  profiles: 'depot_profiles',
  produits: 'depot_produits',
  inventaires: 'depot_inventaires',
  lignes: 'depot_lignes',
  mouvements: 'depot_mouvements',
  lots: 'depot_lots',
  session: 'depot_session',
};

export function getAll(collection) {
  const raw = localStorage.getItem(KEYS[collection] || collection);
  return JSON.parse(raw || '[]');
}

export function setAll(collection, data) {
  localStorage.setItem(KEYS[collection] || collection, JSON.stringify(data));
}

export function getOne(collection, id) {
  const all = getAll(collection);
  return all.find((item) => item.id === id) || null;
}

export function addOne(collection, item) {
  const all = getAll(collection);
  all.push(item);
  setAll(collection, all);
  return item;
}

export function updateOne(collection, id, updates) {
  const all = getAll(collection);
  const idx = all.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates };
  setAll(collection, all);
  return all[idx];
}

export function removeOne(collection, id) {
  const all = getAll(collection);
  const filtered = all.filter((item) => item.id !== id);
  setAll(collection, filtered);
}

export function getSession() {
  const raw = localStorage.getItem(KEYS.session);
  return raw ? JSON.parse(raw) : null;
}

export function setSession(session) {
  if (session) {
    localStorage.setItem(KEYS.session, JSON.stringify(session));
  } else {
    localStorage.removeItem(KEYS.session);
  }
}

export function clearAll() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}

export default {
  getAll,
  setAll,
  getOne,
  addOne,
  updateOne,
  removeOne,
  getSession,
  setSession,
  clearAll,
};
