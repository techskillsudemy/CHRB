# Gestion d'Inventaire Pharmaceutique

Application multi-tenant de gestion d'inventaire pharmaceutique pour dépôts hospitaliers en RDC.

## Stack technique

- **React 18** + **Vite 5**
- **Tailwind CSS v4** (design teal prestige)
- **React Router v6** (navigation)
- **Recharts** (graphiques)
- **react-to-print** (export PDF)
- **date-fns** (formatage dates)

## Installation et lancement

```bash
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## Comptes de connexion par défaut

| Email | Mot de passe | Rôle | Hôpital |
|---|---|---|---|
| admin@depot.cd | admin123 | Super Administrateur | Tous |
| responsable@kin.cd | resp123 | Responsable | Dépôt Kinshasa/Masina |
| directeur@kin.cd | dir123 | Directeur | Dépôt Kinshasa/Masina |
| agent@kin.cd | agent123 | Agent de saisie | Dépôt Kinshasa/Masina |

## Structure des rôles

| Permission | super_admin | responsable | directeur | agent |
|---|:---:|:---:|:---:|:---:|
| Voir tous les hôpitaux | ✅ | ❌ | ❌ | ❌ |
| Créer/modifier hôpitaux | ✅ | ❌ | ❌ | ❌ |
| Gérer les utilisateurs | ✅ | ❌ | ❌ | ❌ |
| Gérer catalogue produits | ✅ | ✅ | ❌ | ❌ |
| Saisir inventaire | ✅ | ✅ | ❌ | ✅ |
| Clôturer inventaire | ✅ | ✅ | ❌ | ❌ |
| Voir stock & rapports | ✅ | ✅ | ✅ | ❌ |
| Imprimer rapports PDF | ✅ | ✅ | ✅ | ❌ |

## Réinitialiser les données

Pour remettre l'application à son état initial :

1. Ouvrir la console du navigateur (F12)
2. Exécuter :
```javascript
Object.keys(localStorage).filter(k => k.startsWith('depot_')).forEach(k => localStorage.removeItem(k));
location.reload();
```

Les données de démonstration (2 hôpitaux, 4 utilisateurs, 86 produits) seront rechargées automatiquement.

## Architecture des données (localStorage)

| Clé | Contenu |
|---|---|
| `depot_hopitaux` | Liste des hôpitaux/dépôts |
| `depot_users` | Liste des utilisateurs |
| `depot_profiles` | Profils/rôles des utilisateurs |
| `depot_produits` | Catalogue de produits |
| `depot_inventaires` | Inventaires (en cours / clôturés) |
| `depot_lignes` | Lignes de saisie d'inventaire |
| `depot_session` | Session utilisateur courante |

## Phase 2 : Migration vers Supabase

Voir [MIGRATION.md](./MIGRATION.md) pour le guide complet de migration localStorage → Supabase.

## Déploiement

```bash
npm run build
# Le dossier dist/ contient l'application prête à déployer
```

Pour Cloudflare Pages, Netlify ou Vercel : pointer vers le dossier `dist/` avec la commande de build `npm run build`.
