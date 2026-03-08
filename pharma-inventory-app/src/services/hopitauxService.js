// src/services/hopitauxService.js
import db from './db.js';

/**
 * Get all hospitals.
 * Phase 2: const { data } = await supabase.from('hopitaux').select('*')
 */
export async function getHopitaux() {
  return db.getAll('hopitaux');
}

/**
 * Get a single hospital by ID.
 * Phase 2: const { data } = await supabase.from('hopitaux').select('*').eq('id', id).single()
 */
export async function getHopital(id) {
  return db.getOne('hopitaux', id);
}

/**
 * Create a new hospital.
 * Phase 2: const { data } = await supabase.from('hopitaux').insert(hopital).select().single()
 */
export async function createHopital(hopital) {
  const newHopital = {
    ...hopital,
    id: hopital.id || 'h' + Date.now(),
    created_at: new Date().toISOString(),
  };
  return db.addOne('hopitaux', newHopital);
}

/**
 * Update a hospital.
 * Phase 2: const { data } = await supabase.from('hopitaux').update(updates).eq('id', id).select().single()
 */
export async function updateHopital(id, updates) {
  return db.updateOne('hopitaux', id, { ...updates, updated_at: new Date().toISOString() });
}

/**
 * Delete a hospital.
 * Phase 2: await supabase.from('hopitaux').delete().eq('id', id)
 */
export async function deleteHopital(id) {
  db.removeOne('hopitaux', id);
}

export default { getHopitaux, getHopital, createHopital, updateHopital, deleteHopital };
