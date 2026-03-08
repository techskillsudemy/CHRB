// src/services/produitsService.js
import db from './db.js';

/**
 * Get all products for a given hospital.
 * Phase 2: const { data } = await supabase.from('produits').select('*').eq('hopital_id', hopitalId)
 */
export async function getProduits(hopitalId) {
  const all = db.getAll('produits');
  return all
    .filter((p) => p.hopital_id === hopitalId)
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));
}

/**
 * Get a single product by ID.
 * Phase 2: const { data } = await supabase.from('produits').select('*').eq('id', id).single()
 */
export async function getProduit(id) {
  return db.getOne('produits', id);
}

/**
 * Create a new product.
 * Phase 2: const { data } = await supabase.from('produits').insert(produit).select().single()
 */
export async function createProduit(produit) {
  const newProduit = {
    ...produit,
    id: produit.id || 'p' + Date.now(),
    created_at: new Date().toISOString(),
  };
  return db.addOne('produits', newProduit);
}

/**
 * Update a product.
 * Phase 2: const { data } = await supabase.from('produits').update(updates).eq('id', id).select().single()
 */
export async function updateProduit(id, updates) {
  return db.updateOne('produits', id, { ...updates, updated_at: new Date().toISOString() });
}

/**
 * Delete a product.
 * Phase 2: await supabase.from('produits').delete().eq('id', id)
 */
export async function deleteProduit(id) {
  db.removeOne('produits', id);
}

/**
 * Count lots expiring soon (within 3 months) for a hospital.
 * Uses lot-level expiration (not product-level).
 */
export async function getExpiringCount(hopitalId) {
  const { getLots } = await import('./lotsService.js');
  const lots = getLots(hopitalId);
  const now = new Date();
  const threeMonths = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
  return lots.filter((l) => {
    if (!l.date_expiration) return false;
    const exp = new Date(l.date_expiration);
    return exp <= threeMonths && exp >= now;
  }).length;
}

/**
 * Count expired lots for a hospital.
 * Uses lot-level expiration (not product-level).
 */
export async function getExpiredCount(hopitalId) {
  const { getLots } = await import('./lotsService.js');
  const lots = getLots(hopitalId);
  const now = new Date();
  return lots.filter((l) => {
    if (!l.date_expiration) return false;
    return new Date(l.date_expiration) < now;
  }).length;
}

export default {
  getProduits,
  getProduit,
  createProduit,
  updateProduit,
  deleteProduit,
  getExpiringCount,
  getExpiredCount,
};
