// src/services/lotsService.js
import { getAll, setAll, addOne } from './db.js';

/**
 * Get all lots for a hospital, optionally filtered by product.
 * Only returns lots with quantite > 0 by default.
 */
export function getLots(hopitalId, produitId = null, includeEmpty = false) {
  const all = getAll('lots');
  let filtered = all.filter((l) => l.hopital_id === hopitalId);
  if (produitId) filtered = filtered.filter((l) => l.produit_id === produitId);
  if (!includeEmpty) filtered = filtered.filter((l) => l.quantite > 0);
  return filtered.sort((a, b) => {
    // Sort by expiration date ascending (FEFO — First Expired First Out)
    if (a.date_expiration && b.date_expiration) return a.date_expiration.localeCompare(b.date_expiration);
    if (a.date_expiration) return -1;
    if (b.date_expiration) return 1;
    return a.created_at.localeCompare(b.created_at);
  });
}

/**
 * Add quantity to an existing lot or create a new one.
 * Returns the updated/created lot.
 */
export function addToLot(hopitalId, produitId, produitNom, lotNumber, dateExpiration, quantite) {
  const all = getAll('lots');
  // Find existing lot with same (hopital, produit, lot_number)
  const idx = all.findIndex(
    (l) => l.hopital_id === hopitalId && l.produit_id === produitId && l.lot_number === lotNumber
  );

  if (idx !== -1) {
    // Update existing lot quantity + expiration if provided
    all[idx].quantite += quantite;
    if (dateExpiration) all[idx].date_expiration = dateExpiration;
    setAll('lots', all);
    return all[idx];
  }

  // Create new lot
  const lot = {
    id: 'lot_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    hopital_id: hopitalId,
    produit_id: produitId,
    produit_nom: produitNom,
    lot_number: lotNumber,
    date_expiration: dateExpiration || '',
    quantite,
    created_at: new Date().toISOString(),
  };
  addOne('lots', lot);
  return lot;
}

/**
 * Remove quantity from a specific lot.
 * Throws if insufficient quantity.
 */
export function removeFromLot(lotId, quantite) {
  const all = getAll('lots');
  const idx = all.findIndex((l) => l.id === lotId);
  if (idx === -1) throw new Error('Lot introuvable');
  if (all[idx].quantite < quantite) {
    throw new Error(`Stock lot insuffisant. Disponible : ${all[idx].quantite}`);
  }
  all[idx].quantite -= quantite;
  setAll('lots', all);
  return all[idx];
}

/**
 * Clean all existing lots (for data reset).
 */
export function clearLots() {
  setAll('lots', []);
}

export default { getLots, addToLot, removeFromLot, clearLots };
