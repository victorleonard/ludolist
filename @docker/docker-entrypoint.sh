#!/bin/sh
set -e

# Créer les dossiers nécessaires s'ils n'existent pas
mkdir -p /data/db
mkdir -p /app/public/uploads
mkdir -p /app/.tmp
mkdir -p /app/dist/build
mkdir -p /app/node_modules/@strapi/admin/dist/server/server/build

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

# Vérifier si l'admin panel est construit et le construire si nécessaire
# Dans Strapi 5, l'admin panel doit être dans node_modules/@strapi/admin/dist/server/server/build/
if [ "$1" = "npm" ] && [ "$2" = "start" ]; then
  if [ ! -f /app/node_modules/@strapi/admin/dist/server/server/build/index.html ]; then
    echo "⚠️  Admin panel non construit, construction au démarrage..."
    # Construire l'admin panel avec toutes les dépendances disponibles
    su-exec strapi npm run build 2>&1 | head -50 || echo "⚠️  Le build a échoué, Strapi construira l'admin au runtime"
    # Vérifier si le build a réussi
    if [ -f /app/node_modules/@strapi/admin/dist/server/server/build/index.html ]; then
      echo "✅ Admin panel construit avec succès"
    else
      echo "⚠️  Admin panel non construit, sera construit au runtime lors du premier accès à /admin"
    fi
  fi
fi

# Passer à l'utilisateur strapi et exécuter la commande
exec su-exec strapi "$@"
