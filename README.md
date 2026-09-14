# Le Garde-Manger

Carnet de recettes numérique, façon carnet manuscrit, pour centraliser et partager les recettes de famille.

Le cahier des charges complet se trouve dans [`docs/cahier-des-charges.md`](docs/cahier-des-charges.md).

## Stack technique

- **Frontend :** Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Auth :** Firebase Authentication — connexion par lien magique (email link, sans mot de passe)
- **Base de données :** Firebase Firestore
- **Photos de recettes :** désactivées pour l'instant (voir section [Photos](#photos-de-recettes) ci-dessous)
- **Hébergement :** Vercel (offre gratuite)

L'accès est restreint aux emails présents dans la collection Firestore `allowed_emails` (liste blanche), gérée via la console Firebase ou le script `scripts/manage-whitelist.mjs`.

## Démarrer en local

### 1. Prérequis

- Node.js 20+
- Un projet Firebase avec Authentication (Email link) et Firestore activés

### 2. Installation

```bash
npm install
cp .env.local.example .env.local
```

Renseignez les variables `NEXT_PUBLIC_FIREBASE_*` dans `.env.local` avec la configuration de votre projet Firebase (Console Firebase → Paramètres du projet → Vos applications). Ce fichier n'est jamais commité.

Dans la console Firebase :
- **Authentication → Sign-in method** : activer "E-mail/Password" puis l'option "Lien de messagerie électronique (connexion sans mot de passe)".
- **Authentication → Settings → Authorized domains** : ajouter votre domaine Vercel (et `localhost` est déjà présent par défaut).

### 3. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

### 4. Ajouter des emails à la liste blanche

Depuis la console Firebase (Firestore → collection `allowed_emails` → un document par email, id = email en minuscules), ou via le script fourni :

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/chemin/vers/votre/service-account.json
node scripts/manage-whitelist.mjs add votre.email@exemple.com
node scripts/manage-whitelist.mjs list
```

Ne commitez jamais la clé de compte de service (`.gitignore` l'exclut déjà si elle est placée dans le repo).

## Photos de recettes

Firebase exige depuis fin 2024 le plan payant **Blaze** (carte bancaire requise) pour créer un bucket Cloud Storage, même si l'usage réel reste gratuit pour un petit site. Ce point a été repoussé : les recettes n'ont pour l'instant pas de photo (`photoUrls` reste vide).

Options pour réactiver les photos plus tard :
- **Passer en Blaze** dans la console Firebase, puis créer le bucket Storage → décommenter `storage.rules` dans `firebase.json` et redéployer les règles ; poser une alerte de budget (1-2 €) dans Google Cloud Console pour rester tranquille (le quota gratuit inclus dans Blaze — 5 Go de stockage, 1 Go/jour — suffit largement à ce volume).
- **Un hébergeur d'images externe** (ex. Cloudinary, gratuit sans carte bancaire) : il suffirait de réintroduire un upload dans `src/lib/` qui appelle son API et stocke l'URL renvoyée dans `photoUrls`.

`storage.rules` reste dans le repo, prête à être déployée le jour où Storage est activé.

## Règles de sécurité

Les règles Firestore (`firestore.rules`) n'autorisent la lecture/écriture des recettes et auteurs qu'aux utilisateurs authentifiés dont l'email figure dans `allowed_emails`. La collection `allowed_emails` elle-même n'est ni lisible ni modifiable depuis le client — uniquement via la console Firebase ou le SDK Admin.

Pour déployer les règles avec la CLI Firebase :

```bash
firebase deploy --only firestore:rules
```

## Déploiement (Vercel)

1. Connecter le dépôt GitHub à un nouveau projet Vercel.
2. Renseigner les mêmes variables `NEXT_PUBLIC_FIREBASE_*` (et `NEXT_PUBLIC_APP_URL` avec l'URL de production) dans les variables d'environnement du projet Vercel.
3. Ajouter le domaine `xxx.vercel.app` dans les domaines autorisés de Firebase Authentication.

## Structure du projet

```
src/
  app/            routes Next.js (accueil, connexion, recettes, catégories, auteurs, à propos)
  components/     composants réutilisables (carte recette, formulaire, filtres, garde d'accès...)
  context/        contexte React d'authentification
  lib/            accès Firebase (auth, Firestore)
  types/          types TypeScript du domaine (recette, auteur...)
docs/             documentation du projet (cahier des charges)
scripts/          scripts d'administration (gestion de la liste blanche)
firestore.rules   règles de sécurité Firestore
storage.rules     règles de sécurité Storage (prêtes, non déployées — voir "Photos de recettes")
```
