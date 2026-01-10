#!/bin/bash

# Script pour mettre à jour l'application Ludolist
# Ce script reconstruit les images et redémarre les conteneurs

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que le script est exécuté depuis le bon répertoire
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ ! -f "$SCRIPT_DIR/docker-compose.yml" ]]; then
    error "Le script doit être exécuté depuis le répertoire @docker"
    exit 1
fi

cd "$SCRIPT_DIR"

# Détecter la commande docker-compose
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

info "Mise à jour de l'application Ludolist..."

# Vérifier que .env existe
if [[ ! -f ".env" ]]; then
    error "Le fichier .env n'existe pas. Exécutez d'abord deploy.sh"
    exit 1
fi

# Arrêter les conteneurs ludolist uniquement
info "Arrêt des conteneurs ludolist..."
info "Note: Seuls les conteneurs ludolist seront arrêtés, les autres conteneurs Docker ne seront pas affectés."
info "✅ Les données (base de données et uploads) seront conservées car elles sont stockées dans @data/ludolist/"
$DOCKER_COMPOSE down

# Reconstruire les images
info "Reconstruction des images Docker..."
$DOCKER_COMPOSE build --no-cache

success "Images reconstruites avec succès"

# Redémarrer les conteneurs
info "Redémarrage des conteneurs..."
$DOCKER_COMPOSE up -d

success "Application mise à jour et redémarrée"

# Afficher l'état
info "État des conteneurs :"
$DOCKER_COMPOSE ps
