#!/bin/bash

# Script pour arrêter l'application Ludolist

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Vérifier que le script est exécuté depuis le bon répertoire
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ ! -f "$SCRIPT_DIR/docker-compose.yml" ]]; then
    echo "Le script doit être exécuté depuis le répertoire @docker"
    exit 1
fi

cd "$SCRIPT_DIR"

# Détecter la commande docker-compose
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

info "Arrêt de l'application Ludolist..."
info "Note: Seuls les conteneurs ludolist seront arrêtés, les autres conteneurs Docker ne seront pas affectés."
info "✅ Les données (base de données et uploads) seront conservées car elles sont stockées dans @data/ludolist/"
$DOCKER_COMPOSE down

success "Application Ludolist arrêtée"
success "Les données sont toujours disponibles dans @data/ludolist/"