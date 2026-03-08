// src/services/authService.js
import db from './db.js';

/**
 * Sign in with email and password.
 * Phase 1: localStorage lookup
 * Phase 2: supabase.auth.signInWithPassword({ email, password })
 */
export async function signIn(email, password) {
  const users = db.getAll('users');
  const user = users.find(
    (u) => u.email === email && u.password === password && u.actif !== false
  );
  if (!user) {
    throw new Error('Email ou mot de passe incorrect');
  }

  const profiles = db.getAll('profiles');
  const profile = profiles.find((p) => p.user_id === user.id) || null;

  const hopitaux = db.getAll('hopitaux');
  const hopital = hopitaux.find((h) => h.code === user.hopital_code) || null;

  const session = {
    user: { id: user.id, email: user.email, nom: user.nom },
    profile,
    hopital,
    role: profile?.role || 'agent',
  };

  db.setSession(session);
  return session;
}

/**
 * Sign out the current user.
 * Phase 2: await supabase.auth.signOut()
 */
export async function signOut() {
  db.setSession(null);
}

/**
 * Get current session from storage.
 * Phase 2: const { data } = await supabase.auth.getSession()
 */
export async function getSession() {
  return db.getSession();
}

/**
 * Check if current user has a specific role.
 */
export async function hasRole(role) {
  const session = db.getSession();
  return session?.role === role;
}

export default { signIn, signOut, getSession, hasRole };
