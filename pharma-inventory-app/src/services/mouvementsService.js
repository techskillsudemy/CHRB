// src/services/mouvementsService.js
import { getAll, getOne, addOne } from './db.js';
import produitsService from './produitsService.js';

/**
 * Get all movements for a hospital, optionally filtered by product.
 * Phase 2: const { data } = await supabase.from('mouvements').select('*').eq('hopital_id', hopitalId).order('created_at', { ascending: false })
 */
export async function getMouvements(hopitalId, produitId = null) {
  const all = getAll('mouvements');
  let filtered = all.filter((m) => m.hopital_id === hopitalId);
  if (produitId) filtered = filtered.filter((m) => m.produit_id === produitId);
  return filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/**
 * Record a new movement (entrée or sortie). Updates product stock_theorique.
 * Phase 2: supabase.from('mouvements').insert(mouvement) + update produits
 */
export async function saveMouvement({ hopital_id, produit_id, type, quantite, lot_number, notes, user_id }) {
  const qty = Number(quantite);
  if (isNaN(qty) || qty <= 0) throw new Error('La quantité doit être un nombre positif');

  // Get current product
  const produit = getOne('produits', produit_id);
  if (!produit) throw new Error('Produit introuvable');

  // Calculate new stock
  const delta = type === 'entree' ? qty : -qty;
  const newStock = (produit.stock_theorique || 0) + delta;
  if (newStock < 0) throw new Error(`Stock insuffisant. Stock actuel : ${produit.stock_theorique}`);

  // Save movement
  const mouvement = {
    id: 'mov_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    hopital_id,
    produit_id,
    produit_nom: produit.nom,
    type,            // 'entree' | 'sortie'
    quantite: qty,
    lot_number: lot_number || '',
    notes: notes || '',
    user_id: user_id || '',
    stock_avant: produit.stock_theorique,
    stock_apres: newStock,
    created_at: new Date().toISOString(),
  };
  addOne('mouvements', mouvement);

  // Update product stock
  await produitsService.updateProduit(produit_id, { stock_theorique: newStock });

  return mouvement;
}

/**
 * Get movement summary (total entrées, sorties) for a product.
 * Phase 2: supabase.from('mouvements').select('type, quantite').eq('produit_id', produitId)
 */
export async function getSummary(hopitalId, produitId) {
  const mouvements = await getMouvements(hopitalId, produitId);
  const totalEntrees = mouvements.filter((m) => m.type === 'entree').reduce((s, m) => s + m.quantite, 0);
  const totalSorties = mouvements.filter((m) => m.type === 'sortie').reduce((s, m) => s + m.quantite, 0);
  return { totalEntrees, totalSorties };
}

export default { getMouvements, saveMouvement, getSummary };
