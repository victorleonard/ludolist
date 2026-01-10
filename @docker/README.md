# Docker Configuration pour Ludolist

Ce répertoire contient la configuration Docker pour déployer l'application Ludolist.

## Structure

- `Dockerfile.backend` : Image Docker pour le backend Strapi
- `Dockerfile.frontend` : Image Docker pour le frontend Nuxt
- `docker-compose.yml` : Orchestration des services
- `env.template` : Template de fichier de variables d'environnement
- `deploy.sh` : Script de déploiement automatique
- `stop.sh` : Script pour arrêter l'application
- `update.sh` : Script pour mettre à jour l'application
- `logs.sh` : Script pour afficher les logs
- `remove-env-from-git.sh` : Script pour retirer le fichier .env du suivi git

## Prérequis

- Docker
- Docker Compose

## Structure des données

Les données sont stockées dans un dossier externe au projet :
```
@data/
└── ludolist/
    ├── db/          # Base de données SQLite
    └── uploads/     # Fichiers uploadés depuis Strapi
```

Ce dossier doit être créé au même niveau que le dossier du projet. Par exemple :
```
/path/to/
├── ludolist/        # Dossier du projet
└── @data/
    └── ludolist/
        ├── db/
        └── uploads/
```

## Démarrage rapide

### Méthode automatique (recommandée)

Utilisez le script de déploiement qui automatise tout le processus :

```bash
cd @docker
./deploy.sh
```

Le script va :
- Vérifier les prérequis (Docker, Docker Compose)
- Créer la structure de dossiers `@data/ludolist/`
- Créer le fichier `.env` depuis le template
- Générer automatiquement les secrets Strapi
- Construire et démarrer les conteneurs
- Afficher les informations de connexion

### Méthode manuelle

1. Créer la structure de dossiers pour les données :
```bash
mkdir -p ../@data/ludolist/db
mkdir -p ../@data/ludolist/uploads
chmod -R 755 ../@data/ludolist
```

2. Copier et configurer le fichier d'environnement :
```bash
cp env.template .env
```

3. Éditer le fichier `.env` et configurer les variables nécessaires, notamment :
   - `APP_KEYS` : Clés d'application Strapi (générer avec `openssl rand -base64 32`)
   - `API_TOKEN_SALT` : Salt pour les tokens API
   - `ADMIN_JWT_SECRET` : Secret JWT pour l'admin
   - `TRANSFER_TOKEN_SALT` : Salt pour les tokens de transfert
   - `JWT_SECRET` : Secret JWT général

4. Construire et démarrer les conteneurs :
```bash
docker-compose up -d --build
```

5. Accéder à l'application :
   - Frontend : http://localhost:3001 (port par défaut, configurable dans .env)
   - Backend (Strapi Admin) : http://localhost:1338/admin (port par défaut, configurable dans .env)

**Note sur les ports** : Les ports par défaut ont été choisis pour éviter les conflits avec d'autres applications (3001 pour le frontend, 1338 pour le backend). Vous pouvez les modifier dans le fichier `.env` si nécessaire.

## Configuration pour la production

L'application est configurée pour fonctionner sur `http://vps-5dd72bcc.vps.ovh.net/` :
- **Frontend** : `http://vps-5dd72bcc.vps.ovh.net:3001`
- **Backend (API)** : `http://vps-5dd72bcc.vps.ovh.net:1338`
- **Backend (Admin)** : `http://vps-5dd72bcc.vps.ovh.net:1338/admin`

Les variables d'environnement suivantes doivent être configurées dans le fichier `.env` :
- `NUXT_PUBLIC_API_URL` : URL de l'API backend (accessible depuis le navigateur)
- `CORS_ORIGIN` : Origines autorisées pour les requêtes CORS
- `PUBLIC_URL` : URL publique du backend

Ces valeurs sont déjà configurées dans `env.template` pour la production.

## Scripts de gestion

Plusieurs scripts sont disponibles pour faciliter la gestion de l'application :

### Déploiement
```bash
./deploy.sh
```
Déploie l'application pour la première fois ou après des modifications majeures.

### Arrêt
```bash
./stop.sh
```
Arrête tous les conteneurs de l'application.

### Mise à jour
```bash
./update.sh
```
Reconstruit les images et redémarre l'application (utile après une mise à jour du code).

### Logs
```bash
./logs.sh              # Tous les services
./logs.sh backend      # Seulement le backend
./logs.sh frontend     # Seulement le frontend
```
Affiche les logs des conteneurs en temps réel.

## Commandes Docker Compose utiles

### Voir les logs (sans script)
```bash
docker-compose logs -f
```

### Arrêter les services
```bash
docker-compose down
```

### Reconstruire les images
```bash
docker-compose build --no-cache
```

### Redémarrer un service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Accéder au shell du backend
```bash
docker-compose exec backend sh
```

### Accéder au shell du frontend
```bash
docker-compose exec frontend sh
```

### Voir l'état des conteneurs
```bash
docker-compose ps
```

## Configuration de la base de données

Par défaut, l'application utilise SQLite. Pour utiliser PostgreSQL ou MySQL, vous pouvez :

1. Ajouter un service de base de données dans `docker-compose.yml`
2. Configurer les variables d'environnement dans `.env`
3. Redémarrer les services

## Stockage des données

Les données sont persistées dans des dossiers bind mounts sur l'hôte :
- **`@data/ludolist/db/`** : Base de données SQLite (montée dans `/data/db` à l'intérieur du conteneur)
  - Le fichier de base de données sera créé dans `@data/ludolist/db/data.db` sur l'hôte
- **`@data/ludolist/uploads/`** : Fichiers uploadés depuis Strapi (montée dans `/app/public/uploads` à l'intérieur du conteneur)

**Note** : Le chemin `../@data/ludolist/db` est relatif au dossier `@docker/`. Le dossier `@data/` doit être au même niveau que le dossier du projet `ludolist/`.

### Persistance des données lors d'un redéploiement

✅ **Les données sont automatiquement conservées** lors d'un redéploiement car elles sont stockées dans des dossiers bind mounts sur l'hôte, en dehors des conteneurs Docker.

**Les données sont conservées même si vous :**
- Arrêtez les conteneurs (`docker-compose down`)
- Supprimez les conteneurs
- Reconstruisez les images (`docker-compose build`)
- Redéployez l'application (`./update.sh` ou `./deploy.sh`)

**Pour supprimer les données** (attention, action irréversible) :
```bash
# Arrêter les conteneurs
docker-compose down

# Supprimer les dossiers de données
rm -rf ../@data/ludolist/db/*
rm -rf ../@data/ludolist/uploads/*
```

**⚠️ Important** : Les données sont stockées sur le système de fichiers de l'hôte. Assurez-vous de faire des sauvegardes régulières du dossier `@data/ludolist/`.

Ces dossiers sont créés automatiquement si nécessaire, mais il est recommandé de les créer manuellement avec les bonnes permissions avant le premier démarrage.

## Gestion des ports et autres conteneurs

Les scripts de déploiement sont conçus pour ne pas affecter les autres conteneurs Docker en cours d'exécution :
- `docker-compose down` n'arrête que les conteneurs définis dans le `docker-compose.yml` de ce projet
- Les ports par défaut (3001 pour le frontend, 1338 pour le backend) ont été choisis pour éviter les conflits
- Vous pouvez modifier les ports dans le fichier `.env` si nécessaire

**Note importante** : Si vous avez d'autres applications Docker en cours d'exécution, elles ne seront pas affectées par les scripts de déploiement de Ludolist.

## Sécurité

⚠️ **Important** : Ne commitez jamais le fichier `.env` avec des secrets réels en production. Utilisez un gestionnaire de secrets approprié.

### Protection du fichier .env

Le fichier `.env` est automatiquement ignoré par git grâce aux fichiers `.gitignore` :
- `.gitignore` dans le dossier `@docker/`
- `.gitignore` à la racine du projet

**Si le fichier `.env` a déjà été commité par erreur**, utilisez le script pour le retirer :

```bash
./remove-env-from-git.sh
```

Ce script retire le fichier du suivi git sans le supprimer du disque.

**Vérification** : Pour vérifier que le fichier est bien ignoré :
```bash
git check-ignore -v @docker/.env
```

Si la commande retourne une ligne, le fichier est bien ignoré.
