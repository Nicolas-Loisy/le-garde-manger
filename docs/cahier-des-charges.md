# Cahier des charges — Le Garde-Manger

## 1. Présentation du projet

**Nom du projet :** Le Garde-Manger
**Type :** Site personnel de recettes de cuisine, façon carnet de recettes
**Objectif :** Créer un espace numérique convivial pour stocker, organiser, retrouver et partager des recettes de cuisine, avec une identité visuelle chaleureuse évoquant un carnet manuscrit.

## 2. Objectifs

- Centraliser des recettes personnelles ou familiales dans un espace unique
- Offrir une navigation simple et agréable (recherche, tri, filtres)
- Mettre en valeur l'auteur de chaque recette (transmission, souvenirs)
- Proposer des suggestions de recettes pertinentes
- Garder une esthétique "carnet fait main" (papier, écriture, tampons, etc.)

## 3. Public cible

- Usage personnel et/ou familial
- Partage possible avec proches ou visiteurs externes
- Pas de vocation commerciale a priori (à confirmer)

## 4. Fonctionnalités principales

### 4.1 Gestion des recettes
- Ajout / modification / suppression d'une recette
- Champs par recette :
  - Titre
  - Photo(s) *(optionnel)*
  - Auteur (nom, éventuellement avatar ou petite note personnelle)
  - Catégorie : entrée / plat / dessert / autre (extensible)
  - Type de cuisine (ex. italienne, asiatique, familiale…) — optionnel
  - Liste d'ingrédients (quantités modifiables selon le nombre de portions)
  - Étapes de préparation
  - Temps de préparation / cuisson / repos
  - Difficulté (facile / moyen / difficile)
  - Nombre de portions
  - Tags libres (ex. "sans gluten", "rapide", "hiver")
  - Date d'ajout
  - Notes personnelles / anecdotes (partie "carnet")

### 4.2 Tri et recherche
- Recherche par mot-clé (titre, ingrédient)
- Filtres combinables :
  - Catégorie (plat/dessert/entrée)
  - Auteur
  - Temps de préparation
  - Difficulté
  - Tags
- Tri : alphabétique, date d'ajout, popularité (si notation), temps de préparation

### 4.3 Suggestions
- Recettes similaires (même catégorie/tags)
- "Recette du jour" ou suggestion aléatoire
- Suggestions selon ingrédients disponibles (fonctionnalité avancée, optionnelle en V2)

### 4.4 Auteurs
- Page ou encart par auteur listant ses recettes
- Petite bio/présentation possible

### 4.5 Expérience "carnet"
- Design évoquant un carnet manuscrit (police type écriture, texture papier, illustrations/tampons)
- Mode "fiche recette" imprimable (mise en page simplifiée)

## 5. Arborescence indicative

- Accueil (mise en avant, suggestions, recherche)
- Toutes les recettes (liste filtrable)
- Par catégorie (Plats / Desserts / Entrées…)
- Par auteur
- Fiche recette (détail)
- À propos / le projet

## 6. Contraintes techniques

- Site web responsive (mobile + desktop)
- Accès restreint par liste blanche d'emails (voir §6.2)
- Gestion des images (upload, redimensionnement)
- Hébergement gratuit (voir §6.1)

### 6.1 Hébergement (gratuit)

Recommandation : **Vercel** (offre gratuite "Hobby")
- Déploiement automatique depuis un dépôt GitHub
- Fonctionne très bien avec Next.js (front + petites fonctions serveur/API)
- HTTPS et nom de domaine `xxx.vercel.app` inclus gratuitement (domaine perso possible ensuite si souhaité)
- Limite largement suffisante pour un usage personnel/familial

Alternatives équivalentes : Netlify, Cloudflare Pages + Workers, Render (free tier, un peu plus limité en "cold start").

### 6.2 Authentification & liste blanche d'emails

Principe : connexion par **lien magique envoyé par email** (pas de mot de passe à gérer), avec vérification que l'email fait partie d'une liste blanche avant d'autoriser l'accès.

Solution retenue : **Firebase Authentication**
- Envoi de "magic link" par email intégré nativement (Email Link Sign-In)
- Collection `allowed_emails` dans Firestore : à la connexion, on vérifie que l'email est présent dans cette collection avant de valider l'accès à l'application
- Gestion des emails autorisés depuis la console Firebase ou une petite interface admin

### 6.3 Base de données — Firebase (Firestore)

Solution retenue : **Firebase**, offre gratuite "Spark" (gratuite en continu, sans carte bancaire requise)
- **Firestore** : base NoSQL orientée documents — bien adaptée pour stocker une recette avec ses ingrédients et étapes imbriqués
- **Firebase Authentication** : gestion des connexions par email (voir §6.2)
- **Firebase Storage** : stockage des photos de recettes
- Un seul écosystème pour la BDD, l'auth et les images, ce qui simplifie le développement

Limites gratuites Firebase à garder en tête (largement suffisantes pour un usage personnel/familial) :
- Firestore : 1 Go de stockage, ~50 000 lectures/jour, ~20 000 écritures/jour
- Storage : 5 Go de stockage, 1 Go de téléchargement/jour
- Authentication : illimité pour l'auth par email

## 7. Décisions confirmées

- **Auteurs / droits d'ajout :** toi + famille/amis proches peuvent ajouter des recettes (pas besoin d'ouvrir l'ajout à tous les emails de la whitelist — possibilité de distinguer plus tard un rôle "contributeur" vs "lecteur" si besoin, mais pas nécessaire au lancement)
- **Volume prévu :** quelques dizaines de recettes au départ → largement dans les limites gratuites de Firebase (§6.3)
- **Notes/avis :** pas de système de notation prévu → simplifie l'application (pas de gestion d'agrégation de notes, pas de risque de "vote" entre proches)

## 8. Stack technique proposée (résumé)

- **Frontend :** Next.js (React)
- **Hébergement :** Vercel (gratuit)
- **Base de données + Auth + Stockage images :** Firebase (Firestore, Authentication, Storage — offre gratuite Spark)
- **Nom de domaine :** `garde-manger.vercel.app` au départ, domaine personnalisé possible plus tard (payant, ~10€/an, optionnel)

## 9. Prochaines étapes proposées

1. Valider ce cahier des charges (ajustements, priorités)
2. Créer le projet Firebase (Firestore + Auth + Storage) et le repo GitHub / projet Vercel
3. Créer une maquette visuelle (style carnet)
4. Développer une première version avec quelques recettes de test et la liste blanche d'emails
