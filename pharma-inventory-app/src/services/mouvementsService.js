// src/services/mouvementsService.js
import { getAll, setAll, getOne, addOne } from './db.js';
import produitsService from './produitsService.js';
import lotsService from './lotsService.js';

/**
 * Get all movements for a hospital, optionally filtered by product.
 */
export async function getMouvements(hopitalId, produitId = null) {
  const all = getAll('mouvements');
  let filtered = all.filter((m) => m.hopital_id === hopitalId);
  if (produitId) filtered = filtered.filter((m) => m.produit_id === produitId);
  return filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/**
 * Record a new ENTRÉE. Creates/updates the lot and updates product stock.
 */
export async function saveEntree({ hopital_id, produit_id, quantite, lot_number, date_expiration, notes, user_id }) {
  const qty = Number(quantite);
  if (isNaN(qty) || qty <= 0) throw new Error('La quantité doit être un nombre positif');
  if (!lot_number) throw new Error('Le numéro de lot est obligatoire');

  const produit = getOne('produits', produit_id);
  if (!produit) throw new Error('Produit introuvable');

  const newStock = (produit.stock_theorique || 0) + qty;

  // Add to lot
  lotsService.addToLot(hopital_id, produit_id, produit.nom, lot_number, date_expiration, qty);

  // Save movement
  const mouvement = {
    id: 'mov_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    hopital_id,
    produit_id,
    produit_nom: produit.nom,
    type: 'entree',
    quantite: qty,
    lot_number,
    date_expiration: date_expiration || '',
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
 * Record a new SORTIE. Decrements the specified lot and updates product stock.
 */
export async function saveSortie({ hopital_id, produit_id, quantite, lot_id, notes, user_id }) {
  const qty = Number(quantite);
  if (isNaN(qty) || qty <= 0) throw new Error('La quantité doit être un nombre positif');
  if (!lot_id) throw new Error('Veuillez sélectionner un lot');

  const produit = getOne('produits', produit_id);
  if (!produit) throw new Error('Produit introuvable');

  const newStock = (produit.stock_theorique || 0) - qty;
  if (newStock < 0) throw new Error(`Stock insuffisant. Stock actuel : ${produit.stock_theorique}`);

  // Get lot info before decrementing
  const lots = getAll('lots');
  const lot = lots.find((l) => l.id === lot_id);
  if (!lot) throw new Error('Lot introuvable');

  // Remove from lot (will throw if insufficient lot quantity)
  lotsService.removeFromLot(lot_id, qty);

  // Save movement
  const mouvement = {
    id: 'mov_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    hopital_id,
    produit_id,
    produit_nom: produit.nom,
    type: 'sortie',
    quantite: qty,
    lot_number: lot.lot_number,
    date_expiration: lot.date_expiration || '',
    lot_id,
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
 * Clean all existing movements and lots (data reset).
 */
export function cleanData() {
  setAll('mouvements', []);
  setAll('lots', []);
}

/**
 * Get movement summary (total entrées, sorties) for a product.
 */
export async function getSummary(hopitalId, produitId) {
  const mouvements = await getMouvements(hopitalId, produitId);
  const totalEntrees = mouvements.filter((m) => m.type === 'entree').reduce((s, m) => s + m.quantite, 0);
  const totalSorties = mouvements.filter((m) => m.type === 'sortie').reduce((s, m) => s + m.quantite, 0);
  return { totalEntrees, totalSorties };
}

export default { getMouvements, saveEntree, saveSortie, cleanData, getSummary };
