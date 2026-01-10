#!/bin/sh
set -e

# Créer les dossiers nécessaires s'ils n'existent pas
mkdir -p /data/db
mkdir -p /app/public/uploads
mkdir -p /app/.tmp
mkdir -p /app/dist/build
mkdir -p /app/node_modules/@strapi/admin/dist

# Ajuster les permissions (nécessite d'être root)
# L'utilisateur strapi a l'UID 1001 et appartient au groupe nodejs (GID 1001)
chown -R strapi:nodejs /data/db 2>/dev/null || true
chown -R strapi:nodejs /app/public/uploads 2>/dev/null || true
chown -R strapi:nodejs /app/.tmp 2>/dev/null || true
chown -R strapi:nodejs /app/dist 2>/dev/null || true
chown -R strapi:nodejs /app/node_modules 2>/dev/null || true

# Donner les permissions d'écriture
chmod -R 755 /data/db 2>/dev/null || true
chmod -R 755 /app/public/uploads 2>/dev/null || true
chmod -R 755 /app/.tmp 2>/dev/null || true
chmod -R 755 /app/dist 2>/dev/null || true
chmod -R 755 /app/node_modules 2>/dev/null || true

# Note: Le build de l'admin panel doit être fait dans le Dockerfile
# Si l'admin panel n'est pas construit, Strapi le construira au runtime lors du premier accès à /admin
# Cela peut prendre quelques minutes

# Passer à l'utilisateur strapi et exécuter la commande
exec su-exec strapi "$@"
