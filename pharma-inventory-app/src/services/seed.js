// src/services/seed.js
// Pre-load data on first launch if localStorage is empty

export function seedIfEmpty() {
  if (localStorage.getItem('depot_hopitaux')) return; // already seeded

  // ─── Hospitals ───
  const hopitaux = [
    { id: 'h1', nom: 'Dépôt Kinshasa/Masina', ville: 'Kinshasa', pays: 'RDC', code: 'KIN-001', actif: true, created_at: '2025-01-01T00:00:00Z' },
    { id: 'h2', nom: 'Dépôt Lubumbashi Central', ville: 'Lubumbashi', pays: 'RDC', code: 'LUB-001', actif: true, created_at: '2025-01-01T00:00:00Z' },
  ];

  // ─── Users ───
  const users = [
    { id: 'u1', email: 'admin@depot.cd', password: 'admin123', nom: 'Administrateur Général', hopital_code: null, actif: true, created_at: '2025-01-01T00:00:00Z' },
    { id: 'u2', email: 'responsable@kin.cd', password: 'resp123', nom: 'Chef Pharmacien Kinshasa', hopital_code: 'KIN-001', actif: true, created_at: '2025-01-01T00:00:00Z' },
    { id: 'u3', email: 'directeur@kin.cd', password: 'dir123', nom: 'Directeur Kinshasa', hopital_code: 'KIN-001', actif: true, created_at: '2025-01-01T00:00:00Z' },
    { id: 'u4', email: 'agent@kin.cd', password: 'agent123', nom: 'Agent Saisie Kinshasa', hopital_code: 'KIN-001', actif: true, created_at: '2025-01-01T00:00:00Z' },
  ];

  // ─── Profiles ───
  const profiles = [
    { id: 'prof1', user_id: 'u1', role: 'super_admin', hopital_code: null, created_at: '2025-01-01T00:00:00Z' },
    { id: 'prof2', user_id: 'u2', role: 'responsable', hopital_code: 'KIN-001', created_at: '2025-01-01T00:00:00Z' },
    { id: 'prof3', user_id: 'u3', role: 'directeur', hopital_code: 'KIN-001', created_at: '2025-01-01T00:00:00Z' },
    { id: 'prof4', user_id: 'u4', role: 'agent', hopital_code: 'KIN-001', created_at: '2025-01-01T00:00:00Z' },
  ];

  // ─── Products (80 items for KIN-001) ───
  const produits = [
    { id: 'p1', hopital_id: 'KIN-001', nom: 'CEFTRIAXONE INJ 1G', date_expiration: '2026-12', stock_theorique: 2000, pua: 0.45 },
    { id: 'p2', hopital_id: 'KIN-001', nom: 'CEFTRIAXONE INJ 500MG', date_expiration: '2026-12', stock_theorique: 600, pua: 0.25 },
    { id: 'p3', hopital_id: 'KIN-001', nom: 'PARACETAMOL CES 500MG', date_expiration: '2026-12', stock_theorique: 3000, pua: 0.01 },
    { id: 'p4', hopital_id: 'KIN-001', nom: 'PARACETAMOL INJ', date_expiration: '2026-08', stock_theorique: 400, pua: 1.20 },
    { id: 'p5', hopital_id: 'KIN-001', nom: 'PARACETAMOL SIROP', date_expiration: '2026-11', stock_theorique: 240, pua: 0.45 },
    { id: 'p6', hopital_id: 'KIN-001', nom: 'AMPICILLINE INJ 1G', date_expiration: '2026-08', stock_theorique: 3210, pua: 0.16 },
    { id: 'p7', hopital_id: 'KIN-001', nom: 'AMPICILLINE INJ 500MG', date_expiration: '2026-04', stock_theorique: 2150, pua: 0.09 },
    { id: 'p8', hopital_id: 'KIN-001', nom: 'AMOXICILLINE CES 500MG', date_expiration: '2026-02', stock_theorique: 0, pua: 0.04 },
    { id: 'p9', hopital_id: 'KIN-001', nom: 'AMOXICILLINE SIROP', date_expiration: '2026-06', stock_theorique: 120, pua: 0.50 },
    { id: 'p10', hopital_id: 'KIN-001', nom: 'COTRIMOXAZOLE 480MG CES', date_expiration: '2026-12', stock_theorique: 2000, pua: 0.02 },
    { id: 'p11', hopital_id: 'KIN-001', nom: 'COTRIMOXAZOLE 960MG CES', date_expiration: '2026-12', stock_theorique: 1500, pua: 0.03 },
    { id: 'p12', hopital_id: 'KIN-001', nom: 'COTRIMOXAZOLE SIROP', date_expiration: '2026-11', stock_theorique: 240, pua: 0.45 },
    { id: 'p13', hopital_id: 'KIN-001', nom: 'METRONIDAZOLE INJ', date_expiration: '2026-08', stock_theorique: 600, pua: 0.45 },
    { id: 'p14', hopital_id: 'KIN-001', nom: 'METRONIDAZOLE CES 250MG', date_expiration: '2026-09', stock_theorique: 0, pua: 0.02 },
    { id: 'p15', hopital_id: 'KIN-001', nom: 'CIPROFLOXACINE 500MG', date_expiration: '2026-09', stock_theorique: 0, pua: 0.06 },
    { id: 'p16', hopital_id: 'KIN-001', nom: 'DOXYCYCLINE 100MG', date_expiration: '2026-12', stock_theorique: 0, pua: 0.03 },
    { id: 'p17', hopital_id: 'KIN-001', nom: 'AZITHROMYCINE 250MG', date_expiration: '2026-04', stock_theorique: 140, pua: 0.10 },
    { id: 'p18', hopital_id: 'KIN-001', nom: 'AZITHROMYCINE 500MG', date_expiration: '2026-11', stock_theorique: 420, pua: 0.21 },
    { id: 'p19', hopital_id: 'KIN-001', nom: 'ERYTHROMYCINE 500MG', date_expiration: '2026-08', stock_theorique: 0, pua: 0.10 },
    { id: 'p20', hopital_id: 'KIN-001', nom: 'QUININE INJ', date_expiration: '2026-08', stock_theorique: 600, pua: 0.35 },
    { id: 'p21', hopital_id: 'KIN-001', nom: 'ARTESUNATE INJ', date_expiration: '2026-06', stock_theorique: 60, pua: 1.50 },
    { id: 'p22', hopital_id: 'KIN-001', nom: 'CO-ARTEMETHER 20/120', date_expiration: '2026-10', stock_theorique: 0, pua: 0.88 },
    { id: 'p23', hopital_id: 'KIN-001', nom: 'CO-ARTEMETHER 80/480', date_expiration: '2026-10', stock_theorique: 0, pua: 2.10 },
    { id: 'p24', hopital_id: 'KIN-001', nom: 'CHLOROQUINE CES', date_expiration: '2026-09', stock_theorique: 0, pua: 0.02 },
    { id: 'p25', hopital_id: 'KIN-001', nom: 'FANSIDAR CES', date_expiration: '2026-06', stock_theorique: 0, pua: 0.08 },
    { id: 'p26', hopital_id: 'KIN-001', nom: 'ADRENALINE INJ', date_expiration: '2026-02', stock_theorique: 1530, pua: 0.12 },
    { id: 'p27', hopital_id: 'KIN-001', nom: 'DEXAMETHASONE INJ', date_expiration: '2026-06', stock_theorique: 500, pua: 0.12 },
    { id: 'p28', hopital_id: 'KIN-001', nom: 'HYDROCORTISONE INJ', date_expiration: '2026-07', stock_theorique: 200, pua: 0.35 },
    { id: 'p29', hopital_id: 'KIN-001', nom: 'PREDNISOLONE 5MG', date_expiration: '2026-07', stock_theorique: 0, pua: 0.03 },
    { id: 'p30', hopital_id: 'KIN-001', nom: 'DIAZEPAM INJ', date_expiration: '2026-08', stock_theorique: 200, pua: 0.20 },
    { id: 'p31', hopital_id: 'KIN-001', nom: 'PHENOBARBITAL INJ', date_expiration: '2026-05', stock_theorique: 0, pua: 0.45 },
    { id: 'p32', hopital_id: 'KIN-001', nom: 'PHENOBARBITAL CES', date_expiration: '2026-09', stock_theorique: 0, pua: 0.03 },
    { id: 'p33', hopital_id: 'KIN-001', nom: 'CARBAMAZEPINE 200MG', date_expiration: '2026-09', stock_theorique: 0, pua: 0.04 },
    { id: 'p34', hopital_id: 'KIN-001', nom: 'ATROPINE INJ', date_expiration: '2026-03', stock_theorique: 0, pua: 0.15 },
    { id: 'p35', hopital_id: 'KIN-001', nom: 'FUROSEMIDE INJ', date_expiration: '2026-06', stock_theorique: 300, pua: 0.10 },
    { id: 'p36', hopital_id: 'KIN-001', nom: 'FUROSEMIDE CES 40MG', date_expiration: '2026-09', stock_theorique: 0, pua: 0.02 },
    { id: 'p37', hopital_id: 'KIN-001', nom: 'ENALAPRIL 5MG', date_expiration: '2026-09', stock_theorique: 0, pua: 0.05 },
    { id: 'p38', hopital_id: 'KIN-001', nom: 'ENALAPRIL 10MG', date_expiration: '2026-08', stock_theorique: 0, pua: 0.07 },
    { id: 'p39', hopital_id: 'KIN-001', nom: 'NIFEDIPINE 10MG', date_expiration: '2026-09', stock_theorique: 0, pua: 0.05 },
    { id: 'p40', hopital_id: 'KIN-001', nom: 'DIGOXINE CES 0.25MG', date_expiration: '2026-09', stock_theorique: 0, pua: 0.05 },
    { id: 'p41', hopital_id: 'KIN-001', nom: 'SPIRONOLACTONE 25MG', date_expiration: '2026-07', stock_theorique: 0, pua: 0.10 },
    { id: 'p42', hopital_id: 'KIN-001', nom: 'DOPAMINE INJ', date_expiration: '2026-04', stock_theorique: 0, pua: 1.20 },
    { id: 'p43', hopital_id: 'KIN-001', nom: 'MAGNESIUM SULFATE INJ', date_expiration: '2026-08', stock_theorique: 400, pua: 0.35 },
    { id: 'p44', hopital_id: 'KIN-001', nom: 'OXYTOCINE INJ', date_expiration: '2026-05', stock_theorique: 500, pua: 0.25 },
    { id: 'p45', hopital_id: 'KIN-001', nom: 'DICLOFENAC INJ', date_expiration: '2026-07', stock_theorique: 600, pua: 0.12 },
    { id: 'p46', hopital_id: 'KIN-001', nom: 'TRAMADOL INJ', date_expiration: '2026-09', stock_theorique: 200, pua: 0.35 },
    { id: 'p47', hopital_id: 'KIN-001', nom: 'MORPHINE INJ 10MG', date_expiration: '2026-05', stock_theorique: 0, pua: 1.20 },
    { id: 'p48', hopital_id: 'KIN-001', nom: 'KETAMINE INJ', date_expiration: '2026-11', stock_theorique: 100, pua: 2.50 },
    { id: 'p49', hopital_id: 'KIN-001', nom: 'LIDOCAINE INJ 1%', date_expiration: '2026-09', stock_theorique: 200, pua: 0.35 },
    { id: 'p50', hopital_id: 'KIN-001', nom: 'LIDOCAINE INJ 2%', date_expiration: '2026-09', stock_theorique: 100, pua: 0.45 },
    { id: 'p51', hopital_id: 'KIN-001', nom: 'OMEPRAZOLE 20MG', date_expiration: '2026-11', stock_theorique: 500, pua: 0.05 },
    { id: 'p52', hopital_id: 'KIN-001', nom: 'OMEPRAZOLE INJ 40MG', date_expiration: '2026-08', stock_theorique: 100, pua: 1.20 },
    { id: 'p53', hopital_id: 'KIN-001', nom: 'METOCLOPRAMIDE INJ', date_expiration: '2026-07', stock_theorique: 300, pua: 0.12 },
    { id: 'p54', hopital_id: 'KIN-001', nom: 'RANITIDINE INJ', date_expiration: '2026-06', stock_theorique: 0, pua: 0.15 },
    { id: 'p55', hopital_id: 'KIN-001', nom: 'INSULINE RAPIDE', date_expiration: '2026-02', stock_theorique: 0, pua: 4.50 },
    { id: 'p56', hopital_id: 'KIN-001', nom: 'INSULINE LENTE NPH', date_expiration: '2026-02', stock_theorique: 0, pua: 4.50 },
    { id: 'p57', hopital_id: 'KIN-001', nom: 'METFORMINE 500MG', date_expiration: '2026-08', stock_theorique: 0, pua: 0.04 },
    { id: 'p58', hopital_id: 'KIN-001', nom: 'LEVOTHYROXINE 50MCG', date_expiration: '2026-07', stock_theorique: 0, pua: 0.12 },
    { id: 'p59', hopital_id: 'KIN-001', nom: 'ISONIAZIDE 300MG', date_expiration: '2026-12', stock_theorique: 0, pua: 0.04 },
    { id: 'p60', hopital_id: 'KIN-001', nom: 'RIFAMPICINE 300MG', date_expiration: '2026-12', stock_theorique: 0, pua: 0.12 },
    { id: 'p61', hopital_id: 'KIN-001', nom: 'ETHAMBUTOL 400MG', date_expiration: '2026-12', stock_theorique: 0, pua: 0.08 },
    { id: 'p62', hopital_id: 'KIN-001', nom: 'STREPTOMYCINE INJ 1G', date_expiration: '2026-12', stock_theorique: 0, pua: 0.35 },
    { id: 'p63', hopital_id: 'KIN-001', nom: 'ABACAVIR 3TC 600MG', date_expiration: '2026-09', stock_theorique: 9, pua: 0.00 },
    { id: 'p64', hopital_id: 'KIN-001', nom: 'TENOFOVIR 300MG', date_expiration: '2026-10', stock_theorique: 200, pua: 0.00 },
    { id: 'p65', hopital_id: 'KIN-001', nom: 'LAMIVUDINE 300MG', date_expiration: '2026-10', stock_theorique: 100, pua: 0.00 },
    { id: 'p66', hopital_id: 'KIN-001', nom: 'EFAVIRENZ 600MG', date_expiration: '2026-10', stock_theorique: 100, pua: 0.00 },
    { id: 'p67', hopital_id: 'KIN-001', nom: 'NEVIRAPINE 200MG', date_expiration: '2026-10', stock_theorique: 150, pua: 0.00 },
    { id: 'p68', hopital_id: 'KIN-001', nom: 'LOPINAVIR/RITONAVIR', date_expiration: '2026-10', stock_theorique: 50, pua: 0.00 },
    { id: 'p69', hopital_id: 'KIN-001', nom: 'FLUCONAZOLE 200MG', date_expiration: '2026-08', stock_theorique: 50, pua: 0.45 },
    { id: 'p70', hopital_id: 'KIN-001', nom: 'SALBUTAMOL INH', date_expiration: '2026-09', stock_theorique: 50, pua: 1.50 },
    { id: 'p71', hopital_id: 'KIN-001', nom: 'VITAMINE B COMPLEXE INJ', date_expiration: '2026-07', stock_theorique: 500, pua: 0.20 },
    { id: 'p72', hopital_id: 'KIN-001', nom: 'VITAMINE C INJ', date_expiration: '2026-08', stock_theorique: 400, pua: 0.15 },
    { id: 'p73', hopital_id: 'KIN-001', nom: 'ACIDE FOLIQUE CES', date_expiration: '2027-07', stock_theorique: 190, pua: 0.05 },
    { id: 'p74', hopital_id: 'KIN-001', nom: 'ZINC 20MG', date_expiration: '2026-11', stock_theorique: 0, pua: 0.05 },
    { id: 'p75', hopital_id: 'KIN-001', nom: 'SERINGUE 2ML', date_expiration: '2028-01', stock_theorique: 2000, pua: 0.05 },
    { id: 'p76', hopital_id: 'KIN-001', nom: 'SERINGUE 5ML', date_expiration: '2028-01', stock_theorique: 2000, pua: 0.06 },
    { id: 'p77', hopital_id: 'KIN-001', nom: 'SERINGUE 10ML', date_expiration: '2028-01', stock_theorique: 1500, pua: 0.07 },
    { id: 'p78', hopital_id: 'KIN-001', nom: 'SERINGUE 20ML', date_expiration: '2028-01', stock_theorique: 500, pua: 0.09 },
    { id: 'p79', hopital_id: 'KIN-001', nom: 'GANTS D EXAMEN', date_expiration: '2028-06', stock_theorique: 2000, pua: 0.05 },
    { id: 'p80', hopital_id: 'KIN-001', nom: 'GANTS CHIRURGICAUX 7.0', date_expiration: '2028-01', stock_theorique: 400, pua: 0.35 },
    { id: 'p81', hopital_id: 'KIN-001', nom: 'ANGIOCATH 18', date_expiration: '2026-03', stock_theorique: 4100, pua: 0.15 },
    { id: 'p82', hopital_id: 'KIN-001', nom: 'AIGUILLE PL 22 LONG', date_expiration: '2029-11', stock_theorique: 126, pua: 0.80 },
    { id: 'p83', hopital_id: 'KIN-001', nom: 'BAXTER GLUCOSE 5%', date_expiration: '2026-10', stock_theorique: 960, pua: 1.50 },
    { id: 'p84', hopital_id: 'KIN-001', nom: 'BAXTER NaCl 0.9%', date_expiration: '2026-10', stock_theorique: 720, pua: 1.50 },
    { id: 'p85', hopital_id: 'KIN-001', nom: 'BAXTER RINGER LACTATE', date_expiration: '2026-10', stock_theorique: 480, pua: 1.50 },
    { id: 'p86', hopital_id: 'KIN-001', nom: 'ALCOOL DENATURE 1L', date_expiration: '2026-11', stock_theorique: 104, pua: 2.60 },
  ].map((p) => ({ ...p, created_at: '2025-01-01T00:00:00Z' }));

  localStorage.setItem('depot_hopitaux', JSON.stringify(hopitaux));
  localStorage.setItem('depot_users', JSON.stringify(users));
  localStorage.setItem('depot_profiles', JSON.stringify(profiles));
  localStorage.setItem('depot_produits', JSON.stringify(produits));
  localStorage.setItem('depot_inventaires', JSON.stringify([]));
  localStorage.setItem('depot_lignes', JSON.stringify([]));
  localStorage.setItem('depot_mouvements', JSON.stringify([]));

  console.log('✅ Données initiales chargées avec succès');
}
