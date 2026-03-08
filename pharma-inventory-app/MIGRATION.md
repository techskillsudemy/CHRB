# MIGRATION.md — localStorage → Supabase

Guide complet pour migrer l'application de localStorage (Phase 1) vers Supabase (Phase 2).

---

## 1. Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com) et créer un nouveau projet
2. Noter l'**URL** et la **clé anon** depuis Settings → API
3. Créer un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon
```

---

## 2. Installer le SDK Supabase

```bash
npm install @supabase/supabase-js
```

---

## 3. Activer le client Supabase

Modifier `src/supabase.js` — décommenter tout le fichier :

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
```

---

## 4. Schéma SQL — Exécuter dans Supabase SQL Editor

```sql
-- ═══════════════════════════════════════
-- TABLES
-- ═══════════════════════════════════════

CREATE TABLE hopitaux (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nom TEXT NOT NULL,
  ville TEXT NOT NULL,
  pays TEXT NOT NULL DEFAULT 'RDC',
  code TEXT UNIQUE NOT NULL,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'responsable', 'directeur', 'agent')),
  hopital_code TEXT REFERENCES hopitaux(code),
  nom TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE produits (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  hopital_id TEXT NOT NULL,  -- corresponds to hopitaux.code
  nom TEXT NOT NULL,
  date_expiration TEXT NOT NULL,
  stock_theorique INTEGER DEFAULT 0,
  pua NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE inventaires (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  hopital_id TEXT NOT NULL,
  mois TEXT NOT NULL,  -- format: YYYY-MM
  statut TEXT DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'cloture')),
  created_at TIMESTAMPTZ DEFAULT now(),
  cloture_at TIMESTAMPTZ,
  cloture_par TEXT,
  UNIQUE(hopital_id, mois)
);

CREATE TABLE lignes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  inventaire_id TEXT REFERENCES inventaires(id) ON DELETE CASCADE,
  produit_id TEXT REFERENCES produits(id) ON DELETE CASCADE,
  stock_physique INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  UNIQUE(inventaire_id, produit_id)
);

-- Index pour performance
CREATE INDEX idx_produits_hopital ON produits(hopital_id);
CREATE INDEX idx_inventaires_hopital ON inventaires(hopital_id);
CREATE INDEX idx_lignes_inventaire ON lignes(inventaire_id);

-- ═══════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════

ALTER TABLE hopitaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE lignes ENABLE ROW LEVEL SECURITY;

-- Super admin voit tout
CREATE POLICY "super_admin_all" ON hopitaux FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin'
  ));

CREATE POLICY "super_admin_all" ON produits FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin'
  ));

CREATE POLICY "super_admin_all" ON inventaires FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin'
  ));

CREATE POLICY "super_admin_all" ON lignes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin'
  ));

-- Utilisateurs voient les données de leur hôpital
CREATE POLICY "hopital_users_read" ON produits FOR SELECT
  USING (
    hopital_id IN (
      SELECT hopital_code FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "hopital_responsable_write" ON produits FOR ALL
  USING (
    hopital_id IN (
      SELECT hopital_code FROM profiles WHERE user_id = auth.uid() AND role = 'responsable'
    )
  );

CREATE POLICY "hopital_users_inventaire_read" ON inventaires FOR SELECT
  USING (
    hopital_id IN (
      SELECT hopital_code FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "hopital_saisie_write" ON inventaires FOR ALL
  USING (
    hopital_id IN (
      SELECT hopital_code FROM profiles WHERE user_id = auth.uid() AND role IN ('responsable', 'agent')
    )
  );

CREATE POLICY "hopital_lignes_read" ON lignes FOR SELECT
  USING (
    inventaire_id IN (
      SELECT id FROM inventaires WHERE hopital_id IN (
        SELECT hopital_code FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "hopital_lignes_write" ON lignes FOR ALL
  USING (
    inventaire_id IN (
      SELECT id FROM inventaires WHERE hopital_id IN (
        SELECT hopital_code FROM profiles WHERE user_id = auth.uid() AND role IN ('responsable', 'agent')
      )
    )
  );

-- Profiles : chacun voit le sien, super_admin voit tout
CREATE POLICY "own_profile" ON profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "super_admin_profiles" ON profiles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role = 'super_admin'
  ));
```

---

## 5. Modifications par fichier de service

### `src/services/db.js`

Ce fichier n'est plus nécessaire. Les services utiliseront directement `supabase`.

### `src/services/authService.js`

```javascript
// REMPLACER TOUT LE CONTENU PAR :
import supabase from '../supabase.js';

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Email ou mot de passe incorrect');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', data.user.id)
    .single();

  const { data: hopital } = profile?.hopital_code
    ? await supabase.from('hopitaux').select('*').eq('code', profile.hopital_code).single()
    : { data: null };

  return {
    user: { id: data.user.id, email: data.user.email, nom: profile?.nom },
    profile,
    hopital,
    role: profile?.role || 'agent',
  };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  const { data: hopital } = profile?.hopital_code
    ? await supabase.from('hopitaux').select('*').eq('code', profile.hopital_code).single()
    : { data: null };

  return {
    user: { id: session.user.id, email: session.user.email, nom: profile?.nom },
    profile,
    hopital,
    role: profile?.role || 'agent',
  };
}

export default { signIn, signOut, getSession };
```

### `src/services/hopitauxService.js`

```javascript
// REMPLACER TOUT LE CONTENU PAR :
import supabase from '../supabase.js';

export async function getHopitaux() {
  const { data } = await supabase.from('hopitaux').select('*').order('nom');
  return data;
}

export async function getHopital(id) {
  const { data } = await supabase.from('hopitaux').select('*').eq('id', id).single();
  return data;
}

export async function createHopital(hopital) {
  const { data } = await supabase.from('hopitaux').insert(hopital).select().single();
  return data;
}

export async function updateHopital(id, updates) {
  const { data } = await supabase.from('hopitaux').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  return data;
}

export async function deleteHopital(id) {
  await supabase.from('hopitaux').delete().eq('id', id);
}

export default { getHopitaux, getHopital, createHopital, updateHopital, deleteHopital };
```

### `src/services/produitsService.js`

```javascript
// REMPLACER TOUT LE CONTENU PAR :
import supabase from '../supabase.js';

export async function getProduits(hopitalId) {
  const { data } = await supabase.from('produits').select('*').eq('hopital_id', hopitalId);
  return data;
}

export async function getProduit(id) {
  const { data } = await supabase.from('produits').select('*').eq('id', id).single();
  return data;
}

export async function createProduit(produit) {
  const { data } = await supabase.from('produits').insert(produit).select().single();
  return data;
}

export async function updateProduit(id, updates) {
  const { data } = await supabase.from('produits').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  return data;
}

export async function deleteProduit(id) {
  await supabase.from('produits').delete().eq('id', id);
}

export async function getExpiringCount(hopitalId) {
  const now = new Date().toISOString().slice(0, 7);
  const future = new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().slice(0, 7);
  const { count } = await supabase.from('produits').select('*', { count: 'exact', head: true })
    .eq('hopital_id', hopitalId).gte('date_expiration', now).lte('date_expiration', future);
  return count;
}

export async function getExpiredCount(hopitalId) {
  const now = new Date().toISOString().slice(0, 7);
  const { count } = await supabase.from('produits').select('*', { count: 'exact', head: true })
    .eq('hopital_id', hopitalId).lt('date_expiration', now);
  return count;
}

export default { getProduits, getProduit, createProduit, updateProduit, deleteProduit, getExpiringCount, getExpiredCount };
```

### `src/services/inventaireService.js`

```javascript
// REMPLACER TOUT LE CONTENU PAR :
import supabase from '../supabase.js';

export async function getInventaires(hopitalId) {
  const { data } = await supabase.from('inventaires').select('*').eq('hopital_id', hopitalId).order('mois', { ascending: false });
  return data;
}

export async function getInventaire(id) {
  const { data } = await supabase.from('inventaires').select('*').eq('id', id).single();
  return data;
}

export async function getOrCreateInventaire(hopitalId, mois) {
  let { data } = await supabase.from('inventaires').select('*').eq('hopital_id', hopitalId).eq('mois', mois).single();
  if (!data) {
    const { data: created } = await supabase.from('inventaires').insert({ hopital_id: hopitalId, mois, statut: 'en_cours' }).select().single();
    data = created;
  }
  return data;
}

export async function cloturerInventaire(id, userId) {
  const { data } = await supabase.from('inventaires').update({ statut: 'cloture', cloture_at: new Date().toISOString(), cloture_par: userId }).eq('id', id).select().single();
  return data;
}

export async function getLignes(inventaireId) {
  const { data } = await supabase.from('lignes').select('*').eq('inventaire_id', inventaireId);
  return data;
}

export async function saveLigne(ligne) {
  const { data } = await supabase.from('lignes').upsert(ligne, { onConflict: 'inventaire_id,produit_id' }).select().single();
  return data;
}

// getLignesAvecProduits stays the same logic — it calls the above functions
export async function getLignesAvecProduits(hopitalId, mois) {
  const inv = await getOrCreateInventaire(hopitalId, mois);
  const lignes = await getLignes(inv.id);
  const { data: produits } = await supabase.from('produits').select('*').eq('hopital_id', hopitalId);

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

export default { getInventaires, getInventaire, getOrCreateInventaire, cloturerInventaire, getLignes, saveLigne, getLignesAvecProduits };
```

### `src/services/usersService.js`

```javascript
// REMPLACER TOUT LE CONTENU PAR :
import supabase from '../supabase.js';

export async function getUsers(hopitalCode) {
  let query = supabase.from('profiles').select('*, user:user_id(email)');
  if (hopitalCode) query = query.eq('hopital_code', hopitalCode);
  const { data } = await query;
  return data?.map(p => ({ id: p.user_id, email: p.user?.email, nom: p.nom, role: p.role, hopital_code: p.hopital_code, actif: true }));
}

export async function createUser(userData) {
  const { data: { user }, error } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true,
  });
  if (error) throw error;

  await supabase.from('profiles').insert({
    user_id: user.id,
    role: userData.role,
    hopital_code: userData.hopital_code,
    nom: userData.nom,
  });

  return { id: user.id, ...userData };
}

export async function updateUser(id, updates) {
  if (updates.role || updates.hopital_code || updates.nom) {
    await supabase.from('profiles').update({
      role: updates.role,
      hopital_code: updates.hopital_code,
      nom: updates.nom,
    }).eq('user_id', id);
  }
  return { id, ...updates };
}

export async function deleteUser(id) {
  await supabase.auth.admin.deleteUser(id);
  // Profile is cascade deleted
}

export default { getUsers, createUser, updateUser, deleteUser };
```

---

## 6. Supprimer le seed

Dans `src/main.jsx`, supprimer la ligne :
```javascript
import { seedIfEmpty } from './services/seed.js'
seedIfEmpty()
```

Les données initiales doivent être importées via le SQL Editor de Supabase ou un script d'import séparé.

---

## 7. Variables d'environnement

Créer `.env` :
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 8. Déploiement Cloudflare Pages

1. Pousser le code sur GitHub
2. Dans Cloudflare Pages → Create a project → Connect to Git
3. Build settings :
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
   - **Root directory** : `/` (ou le sous-dossier si monorepo)
4. Environment variables : ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
5. Créer `public/_redirects` pour React Router :

```
/*    /index.html   200
```

---

## 9. Checklist de migration

- [ ] Créer le projet Supabase
- [ ] Exécuter le schéma SQL
- [ ] `npm install @supabase/supabase-js`
- [ ] Décommenter `src/supabase.js`
- [ ] Remplacer `src/services/authService.js`
- [ ] Remplacer `src/services/hopitauxService.js`
- [ ] Remplacer `src/services/produitsService.js`
- [ ] Remplacer `src/services/inventaireService.js`
- [ ] Remplacer `src/services/usersService.js`
- [ ] Supprimer l'appel `seedIfEmpty()` dans `main.jsx`
- [ ] Créer `.env` avec les clés Supabase
- [ ] Créer les utilisateurs via Supabase Auth
- [ ] Importer les données initiales
- [ ] Créer `public/_redirects` pour SPA routing
- [ ] Tester toutes les fonctionnalités
- [ ] Déployer sur Cloudflare Pages
