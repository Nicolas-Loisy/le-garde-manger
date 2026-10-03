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

## Remplissage automatique par IA

Le formulaire d'ajout de recette propose de coller un texte (recette copiée d'un site, d'un livre...) ou de dicter au micro : l'API [Claude](https://console.anthropic.com) extrait les champs structurés et préremplit le formulaire.

- **Dictée** : reconnaissance vocale native du navigateur (gratuite, fonctionne sur Chrome/Edge — pas Firefox/Safari), qui transcrit dans le champ texte. Le même bouton "Remplir depuis le texte" analyse ensuite ce texte, qu'il soit tapé, collé ou dicté.
- **Appel à Claude** : se fait uniquement côté serveur, via la route `src/app/api/parse-recipe/route.ts` — la clé API n'est jamais exposée au navigateur.

Mise en place :

1. Créez une clé sur [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) (nécessite un compte Anthropic avec un moyen de paiement renseigné — contrairement à Firebase, cette API n'a pas d'offre gratuite).
2. Collez-la dans `.env.local` → `ANTHROPIC_API_KEY` (**sans** préfixe `NEXT_PUBLIC_`, pour qu'elle reste côté serveur).

Sans `ANTHROPIC_API_KEY`, le reste du site fonctionne normalement — seul le remplissage automatique renvoie une erreur.

**Limite quotidienne :** pour éviter un emballement de la facture, chaque remplissage automatique est compté dans la collection Firestore `ai_usage` (un document par jour). Au-delà de 20 par jour (`DAILY_LIMIT` dans `src/lib/ai.ts`), la fonctionnalité se bloque jusqu'au lendemain. C'est une limite coopérative (basée sur le SDK client Firestore, pas une barrière infranchissable) adaptée à un usage familial de confiance, pas à un rempart anti-abus strict.

## Règles de sécurité

Les règles Firestore (`firestore.rules`) n'autorisent la lecture/écriture des recettes et auteurs qu'aux utilisateurs authentifiés dont l'email figure dans `allowed_emails`. La collection `allowed_emails` elle-même n'est ni lisible ni modifiable depuis le client — uniquement via la console Firebase ou le SDK Admin.

Pour déployer les règles avec la CLI Firebase :

```bash
firebase deploy --only firestore:rules
```

## Déploiement (Vercel)

1. Connecter le dépôt GitHub à un nouveau projet Vercel.
2. Renseigner les mêmes variables `NEXT_PUBLIC_FIREBASE_*` (et `NEXT_PUBLIC_APP_URL` avec l'URL de production) ainsi que `ANTHROPIC_API_KEY` dans les variables d'environnement du projet Vercel.
3. Ajouter le domaine `xxx.vercel.app` dans les domaines autorisés de Firebase Authentication.

## Structure du projet

```
src/
  app/            routes Next.js (accueil, connexion, recettes, catégories, auteurs, à propos)
                  + api/parse-recipe (route serveur qui appelle Claude)
  components/     composants réutilisables (carte recette, formulaire, filtres, garde d'accès...)
  context/        contexte React d'authentification
  lib/            accès Firebase (auth, Firestore) et IA (remplissage automatique)
  types/          types TypeScript du domaine (recette, auteur...)
docs/             documentation du projet (cahier des charges)
scripts/          scripts d'administration (gestion de la liste blanche)
firestore.rules   règles de sécurité Firestore
storage.rules     règles de sécurité Storage (prêtes, non déployées — voir "Photos de recettes")
```
