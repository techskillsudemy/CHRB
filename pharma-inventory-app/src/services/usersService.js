// src/services/usersService.js
import db from './db.js';

/**
 * Get all users, optionally filtered by hospital code.
 * Phase 2: const { data } = await supabase.from('users').select('*, profiles(*)')
 */
export async function getUsers(hopitalCode) {
  const all = db.getAll('users');
  if (hopitalCode) {
    return all.filter((u) => u.hopital_code === hopitalCode);
  }
  return all;
}

/**
 * Get a single user by ID.
 * Phase 2: const { data } = await supabase.from('users').select('*').eq('id', id).single()
 */
export async function getUser(id) {
  return db.getOne('users', id);
}

/**
 * Create a new user with profile.
 * Phase 2: supabase.auth.admin.createUser + insert profile
 */
export async function createUser(userData) {
  const user = {
    id: 'u' + Date.now(),
    email: userData.email,
    password: userData.password,
    nom: userData.nom,
    hopital_code: userData.hopital_code || null,
    actif: true,
    created_at: new Date().toISOString(),
  };
  db.addOne('users', user);

  const profile = {
    id: 'prof_' + Date.now(),
    user_id: user.id,
    role: userData.role || 'agent',
    hopital_code: userData.hopital_code || null,
    created_at: new Date().toISOString(),
  };
  db.addOne('profiles', profile);

  return { ...user, profile };
}

/**
 * Update a user.
 * Phase 2: await supabase.from('users').update(updates).eq('id', id)
 */
export async function updateUser(id, updates) {
  const user = db.updateOne('users', id, updates);

  // Also update profile if role changed
  if (updates.role) {
    const profiles = db.getAll('profiles');
    const profileIdx = profiles.findIndex((p) => p.user_id === id);
    if (profileIdx >= 0) {
      profiles[profileIdx].role = updates.role;
      if (updates.hopital_code) {
        profiles[profileIdx].hopital_code = updates.hopital_code;
      }
      db.setAll('profiles', profiles);
    }
  }

  return user;
}

/**
 * Toggle user active status.
 * Phase 2: await supabase.from('users').update({ actif }).eq('id', id)
 */
export async function toggleUserActif(id) {
  const user = db.getOne('users', id);
  if (!user) return null;
  return db.updateOne('users', id, { actif: !user.actif });
}

/**
 * Delete a user and their profile.
 * Phase 2: await supabase.auth.admin.deleteUser(id) + delete profile
 */
export async function deleteUser(id) {
  db.removeOne('users', id);
  const profiles = db.getAll('profiles');
  db.setAll('profiles', profiles.filter((p) => p.user_id !== id));
}

export default { getUsers, getUser, createUser, updateUser, toggleUserActif, deleteUser };
