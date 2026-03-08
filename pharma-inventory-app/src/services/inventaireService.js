// src/services/inventaireService.js
import db from './db.js';

/**
 * Get all inventories for a hospital.
 * Phase 2: const { data } = await supabase.from('inventaires').select('*').eq('hopital_id', hopitalId).order('mois', { ascending: false })
 */
export async function getInventaires(hopitalId) {
  const all = db.getAll('inventaires');
  return all
    .filter((i) => i.hopital_id === hopitalId)
    .sort((a, b) => b.mois.localeCompare(a.mois));
}

/**
 * Get a single inventory by ID.
 * Phase 2: const { data } = await supabase.from('inventaires').select('*').eq('id', id).single()
 */
export async function getInventaire(id) {
  return db.getOne('inventaires', id);
}

/**
 * Get or create inventory for a specific month and hospital.
 * Phase 2: upsert query
 */
export async function getOrCreateInventaire(hopitalId, mois) {
  const all = db.getAll('inventaires');
  let inv = all.find((i) => i.hopital_id === hopitalId && i.mois === mois);
  if (!inv) {
    inv = {
      id: 'inv_' + Date.now(),
      hopital_id: hopitalId,
      mois,
      statut: 'en_cours',
      created_at: new Date().toISOString(),
      cloture_at: null,
      cloture_par: null,
    };
    db.addOne('inventaires', inv);
  }
  return inv;
}

/**
 * Close (clôturer) an inventory.
 * Phase 2: await supabase.from('inventaires').update({ statut: 'cloture', ... }).eq('id', id)
 */
export async function cloturerInventaire(id, userId) {
  return db.updateOne('inventaires', id, {
    statut: 'cloture',
    cloture_at: new Date().toISOString(),
    cloture_par: userId,
  });
}

/**
 * Get all inventory lines for an inventory.
 * Phase 2: const { data } = await supabase.from('lignes').select('*').eq('inventaire_id', inventaireId)
 */
export async function getLignes(inventaireId) {
  const all = db.getAll('lignes');
  return all.filter((l) => l.inventaire_id === inventaireId);
}

/**
 * Save (upsert) an inventory line.
 * Phase 2: await supabase.from('lignes').upsert(ligne)
 */
export async function saveLigne(ligne) {
  const all = db.getAll('lignes');
  const idx = all.findIndex(
    (l) => l.inventaire_id === ligne.inventaire_id && l.produit_id === ligne.produit_id
  );
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...ligne, updated_at: new Date().toISOString() };
  } else {
    all.push({
      ...ligne,
      id: ligne.id || 'lig_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      created_at: new Date().toISOString(),
    });
  }
  db.setAll('lignes', all);
  return ligne;
}

/**
 * Get all inventory lines for a hospital and month (joined with products).
 */
export async function getLignesAvecProduits(hopitalId, mois) {
  const inv = await getOrCreateInventaire(hopitalId, mois);
  const lignes = await getLignes(inv.id);
  const produits = db.getAll('produits').filter((p) => p.hopital_id === hopitalId);

  return produits.map((prod) => {
    const ligne = lignes.find((l) => l.produit_id === prod.id);
    return {
      produit: prod,
      inventaire_id: inv.id,
      produit_id: prod.id,
      stock_theorique: prod.stock_theorique,
      stock_physique: ligne?.stock_physique ?? null,
      ecart: ligne?.stock_physique != null ? ligne.stock_physique - prod.stock_theorique : null,
      pua: prod.pua,
      valeur_theorique: prod.stock_theorique * prod.pua,
      valeur_physique: ligne?.stock_physique != null ? ligne.stock_physique * prod.pua : null,
    };
  });
}

export default {
  getInventaires,
  getInventaire,
  getOrCreateInventaire,
  cloturerInventaire,
  getLignes,
  saveLigne,
  getLignesAvecProduits,
};
