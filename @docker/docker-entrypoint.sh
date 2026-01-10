#!/bin/sh
set -e

# Créer les dossiers nécessaires s'ils n'existent pas
mkdir -p /data/db
mkdir -p /app/public/uploads
mkdir -p /app/.tmp

# Ajuster les permissions (nécessite d'être root)
# L'utilisateur strapi a l'UID 1001 et appartient au groupe nodejs (GID 1001)
chown -R strapi:nodejs /data/db 2>/dev/null || true
chown -R strapi:nodejs /app/public/uploads 2>/dev/null || true
chown -R strapi:nodejs /app/.tmp 2>/dev/null || true

# Donner les permissions d'écriture
chmod -R 755 /data/db 2>/dev/null || true
chmod -R 755 /app/public/uploads 2>/dev/null || true
chmod -R 755 /app/.tmp 2>/dev/null || true

# Passer à l'utilisateur strapi et exécuter la commande
exec su-exec strapi "$@"
