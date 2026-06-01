# REGIDESO S.A. — Plateforme CRM

Système de gestion de la relation client pour la Régie de Distribution d'Eau S.A. à Kinshasa, République Démocratique du Congo.

**Projet Tutoré** — Jean Ngandu · L3 Informatique de Gestion, Option Conception des Systèmes d'Information · HEC-Kinshasa · Année Académique 2025–2026

---

## Fonctionnalités

- **Gestion des abonnés** — ajout, modification, suppression, recherche par nom/commune/contrat
- **Gestion des compteurs** — enregistrement et suivi des compteurs d'eau
- **Relevés d'index** — saisie des index, calcul automatique de la consommation (m³)
- **Facturation automatique** — génération selon les tranches tarifaires REGIDESO (0–6 m³ : 0,35 USD · 7–15 m³ : 0,55 USD · >15 m³ : 0,80 USD)
- **Suivi des paiements** — enregistrement par mode (espèces, mobile money, virement, chèque)
- **Gestion des réclamations** — enregistrement, prise en charge et résolution
- **Tableau de bord** — statistiques globales et graphiques de consommation mensuelle

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend | Node.js 22, Express 5, TypeScript |
| Base de données | PostgreSQL + Drizzle ORM |
| État serveur | TanStack Query v5 |
| Formulaires | React Hook Form + Zod |
| Graphiques | Recharts |

## Prérequis

- Node.js 18+ (recommandé : 22)
- PostgreSQL 14+
- npm 9+

## Installation et démarrage

```bash
# 1. Cloner ou extraire le projet
cd regideso-crm

# 2. Installer les dépendances
npm install

# 3. Copier et configurer les variables d'environnement
cp .env.example .env
# Éditez .env et renseignez DATABASE_URL

# 4. Appliquer le schéma de base de données
npm run db:push

# 5. (Optionnel) Insérer les données de démonstration
node scripts/seed.js

# 6. Démarrer en mode développement
npm run dev
```

Le frontend est accessible sur [http://localhost:5173](http://localhost:5173)  
L'API est accessible sur [http://localhost:3000](http://localhost:3000)

## Déploiement en production

### Option 1 — Render

1. Créez un service **Web Service** (Node.js)
2. Build command : `npm install && npm run build:client`
3. Start command : `node dist/server/index.js`
4. Ajoutez `DATABASE_URL` et `NODE_ENV=production` dans les variables d'environnement

### Option 2 — Railway / Heroku

```bash
npm run build:client
NODE_ENV=production node dist/server/index.js
```

### Option 3 — Frontend Vercel + Backend Render

- Frontend (Vercel) : build command `npm run build:client`, output directory `dist/public`
- Backend (Render) : start command `node dist/server/index.js`
- Configurez `VITE_API_URL` sur l'URL de votre backend Render

## Variables d'environnement

| Variable | Description | Valeur par défaut |
|---|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL | *obligatoire* |
| `PORT` | Port du serveur Express | `3000` |
| `NODE_ENV` | Environnement | `development` |

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Lance frontend + backend en développement |
| `npm run build:client` | Build le frontend React (sortie : `dist/public`) |
| `npm run start` | Lance le serveur en production |
| `npm run db:push` | Applique le schéma Drizzle sur PostgreSQL |
| `npm run db:studio` | Ouvre Drizzle Studio (interface BDD) |

---

© 2025 REGIDESO S.A. — Tous droits réservés.
