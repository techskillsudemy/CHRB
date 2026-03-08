// src/hooks/useHopital.js
import { useState, useEffect, useCallback } from 'react';
import hopitauxService from '../services/hopitauxService.js';

export function useHopital() {
  const [hopitaux, setHopitaux] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await hopitauxService.getHopitaux();
    setHopitaux(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (h) => {
    await hopitauxService.createHopital(h);
    await load();
  }, [load]);

  const update = useCallback(async (id, updates) => {
    await hopitauxService.updateHopital(id, updates);
    await load();
  }, [load]);

  const remove = useCallback(async (id) => {
    await hopitauxService.deleteHopital(id);
    await load();
  }, [load]);

  return { hopitaux, loading, reload: load, create, update, remove };
}

export default useHopital;
