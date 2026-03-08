// src/hooks/useInventaire.js
import { useState, useEffect, useCallback, useRef } from 'react';
import inventaireService from '../services/inventaireService.js';

export function useInventaire(hopitalCode, mois) {
  const [inventaire, setInventaire] = useState(null);
  const [lignes, setLignes] = useState([]);
  const [loading, setLoading] = useState(true);
  const debounceTimers = useRef({});

  const load = useCallback(async () => {
    if (!hopitalCode || !mois) return;
    setLoading(true);
    const inv = await inventaireService.getOrCreateInventaire(hopitalCode, mois);
    setInventaire(inv);
    const data = await inventaireService.getLignesAvecProduits(hopitalCode, mois);
    setLignes(data);
    setLoading(false);
  }, [hopitalCode, mois]);

  useEffect(() => { load(); }, [load]);

  const updateStockPhysique = useCallback(
    (produitId, value) => {
      // Optimistic UI update
      setLignes((prev) =>
        prev.map((l) => {
          if (l.produit_id !== produitId) return l;
          const stockPhysique = value === '' || value === null ? null : Number(value);
          return {
            ...l,
            stock_physique: stockPhysique,
            ecart: stockPhysique != null ? stockPhysique - l.stock_theorique : null,
            valeur_physique: stockPhysique != null ? stockPhysique * l.pua : null,
          };
        })
      );

      // Debounced save
      if (debounceTimers.current[produitId]) {
        clearTimeout(debounceTimers.current[produitId]);
      }
      debounceTimers.current[produitId] = setTimeout(async () => {
        if (!inventaire) return;
        const stockPhysique = value === '' || value === null ? null : Number(value);
        await inventaireService.saveLigne({
          inventaire_id: inventaire.id,
          produit_id: produitId,
          stock_physique: stockPhysique,
        });
      }, 500);
    },
    [inventaire]
  );

  const cloturer = useCallback(
    async (userId) => {
      if (!inventaire) return;
      const updated = await inventaireService.cloturerInventaire(inventaire.id, userId);
      setInventaire(updated);
      return updated;
    },
    [inventaire]
  );

  // Stats
  const totalProduits = lignes.length;
  const saisis = lignes.filter((l) => l.stock_physique !== null).length;
  const avecEcart = lignes.filter((l) => l.ecart !== null && l.ecart !== 0).length;
  const progression = totalProduits > 0 ? Math.round((saisis / totalProduits) * 100) : 0;
  const valeurTheorique = lignes.reduce((s, l) => s + (l.valeur_theorique || 0), 0);
  const valeurPhysique = lignes.reduce((s, l) => s + (l.valeur_physique || 0), 0);

  return {
    inventaire,
    lignes,
    loading,
    reload: load,
    updateStockPhysique,
    cloturer,
    stats: { totalProduits, saisis, avecEcart, progression, valeurTheorique, valeurPhysique },
  };
}

export default useInventaire;
