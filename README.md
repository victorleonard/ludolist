# Ludolist 🎲

**Ludolist** est une application familiale collaborative permettant de gérer et partager des outils pratiques entre les membres d'une même famille.

## 📋 Vue d'ensemble

Ludolist a pour objectif de centraliser diverses fonctionnalités utiles au quotidien familial, en permettant à chaque membre de participer et d'interagir avec les contenus partagés.

## ✨ Fonctionnalités actuelles

### 🎮 Gestion des jeux de société

L'outil principal de Ludolist permet de gérer votre collection de jeux de société avec :

- **Catalogue de jeux** : Liste complète des jeux de la famille
- **Notation** : Chaque membre peut noter les jeux (système d'étoiles)
- **Historique des parties** : Enregistrement de toutes les sessions de jeu
- **Suivi des gagnants** : Qui a gagné chaque partie avec les scores individuels
- **Classement par jeu** : Statistiques et classements pour chaque jeu
- **Statistiques personnalisées** : Visualisation des performances de chaque joueur

## 🚀 Fonctionnalités prévues

### 🍽️ Gestion des recettes

Prochainement disponible :

- **Carnet de recettes familial** : Collection de recettes partagées
- **Notation individuelle** : Chaque membre peut noter les plats
- **Préférences alimentaires** : Suivi des goûts de chacun
- **Historique des repas** : Traçabilité des plats préparés

### 📦 Autres outils à venir

L'application est conçue pour accueillir d'autres modules selon les besoins de la famille :

- Listes partagées (courses, vacances, etc.)
- Calendrier familial
- Budget et dépenses communes
- Bibliothèque (livres, films, séries)
- Et bien plus selon vos besoins !

## 🏗️ Architecture technique

Le projet est organisé en plusieurs modules :

### Backend - Strapi CMS
- **Dossier** : `@back/`
- **Technologie** : Strapi (Headless CMS)
- **Rôle** : API REST pour gérer les données (jeux, sessions, membres, notes, etc.)
- **Base de données** : Configuration flexible (SQLite en dev, PostgreSQL en production)

### Frontend Web - Nuxt.js
- **Dossier** : `@front/`
- **Technologie** : Nuxt 3 (Vue.js)
- **Rôle** : Application web responsive accessible depuis un navigateur
- **Features** : PWA, authentification, interface utilisateur moderne

### Application Mobile Native
- **Dossier** : `@front-native/`
- **Technologie** : React Native avec Expo
- **Rôle** : Application mobile iOS et Android
- **Features** : Navigation native, performances optimisées, expérience mobile

### Infrastructure Docker
- **Dossier** : `@docker/`
- **Rôle** : Déploiement conteneurisé de l'application complète
- **Inclut** : Scripts de déploiement, configuration Docker Compose

## 🎯 Concepts clés

### Famille (Family)
Une famille regroupe plusieurs membres qui partagent les mêmes données et interagissent ensemble sur l'application.

### Membre (Member)
Un utilisateur appartient à une famille et peut :
- Noter les jeux et recettes
- Enregistrer des parties
- Consulter les statistiques
- Participer aux classements

### Session de jeu (Game Session)
Une partie jouée enregistrée avec :
- Le jeu joué
- La date de la partie
- Les participants
- Les scores de chaque joueur
- Le gagnant

### Notation (Rating)
Système de notation permettant à chaque membre de donner son avis sur :
- Les jeux (actuellement)
- Les recettes (à venir)

## 🚦 Démarrage rapide

### Backend (Strapi)

```bash
cd @back
npm install
npm run develop
```

Le backend sera accessible sur `http://localhost:1337`

### Frontend Web (Nuxt)

```bash
cd @front
npm install
npm run dev
```

L'application web sera accessible sur `http://localhost:3000`

### Application Mobile (React Native)

```bash
cd @front-native
npm install
npm run start
```

Utilisez l'application Expo Go pour tester sur votre appareil mobile.

### Déploiement avec Docker

```bash
cd @docker
./deploy.sh
```

## 📱 Plateformes supportées

- **Web** : Tous navigateurs modernes (Chrome, Firefox, Safari, Edge)
- **Mobile** : iOS et Android via l'application native
- **PWA** : Installation possible comme application web progressive

## 🔐 Sécurité et confidentialité

- Authentification requise pour accéder aux données
- Isolation des données par famille
- Chaque membre ne voit que les données de sa famille
- Gestion des permissions selon les rôles

## 🤝 Contribution

Ce projet est développé pour un usage familial. Les fonctionnalités sont ajoutées selon les besoins identifiés.

## 📄 Licence

Projet privé à usage familial.

---

**Ludolist** - _Parce que partager en famille, c'est mieux !_ 🏠✨
