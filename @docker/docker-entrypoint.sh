#!/bin/sh
set -e

# Créer les dossiers nécessaires s'ils n'existent pas
mkdir -p /data/db
mkdir -p /app/public/uploads
mkdir -p /app/.tmp
mkdir -p /app/dist/build

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

# Note: Dans Strapi 5, l'admin panel est construit dans ./dist/build lors du npm run build
# Si le build n'a pas été fait ou a échoué, Strapi construira l'admin panel au runtime lors du premier accès à /admin

# Passer à l'utilisateur strapi et exécuter la commande
exec su-exec strapi "$@"
