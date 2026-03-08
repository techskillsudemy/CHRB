// src/hooks/useAuth.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getSession().then((s) => {
      setSession(s);
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async (email, password) => {
    const s = await authService.signIn(email, password);
    setSession(s);
    return s;
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setSession(null);
  }, []);

  const user = session?.user || null;
  const profile = session?.profile || null;
  const role = session?.role || null;
  const hopital = session?.hopital || null;
  const hopitalCode = profile?.hopital_code || null;

  const isAdmin = useCallback(() => role === 'super_admin', [role]);
  const isResponsable = useCallback(() => role === 'responsable', [role]);
  const isDirecteur = useCallback(() => role === 'directeur', [role]);
  const isAgent = useCallback(() => role === 'agent', [role]);

  const canEdit = useCallback(
    () => role === 'super_admin' || role === 'responsable',
    [role]
  );
  const canSaisir = useCallback(
    () => role === 'responsable' || role === 'agent',
    [role]
  );
  const canCloturer = useCallback(
    () => role === 'responsable' || role === 'super_admin',
    [role]
  );
  const canView = useCallback(() => !!role, [role]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role,
        hopital,
        hopitalCode,
        loading,
        signIn,
        signOut,
        isAdmin,
        isResponsable,
        isDirecteur,
        isAgent,
        canEdit,
        canSaisir,
        canCloturer,
        canView,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default useAuth;
