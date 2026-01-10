#!/bin/bash

# Script pour afficher les logs de l'application Ludolist

# Couleurs
BLUE='\033[0;34m'
NC='\033[0m'

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Afficher les logs
if [[ "$1" == "backend" ]]; then
    info "Logs du backend :"
    $DOCKER_COMPOSE logs -f backend
elif [[ "$1" == "frontend" ]]; then
    info "Logs du frontend :"
    $DOCKER_COMPOSE logs -f frontend
else
    info "Logs de tous les services (Ctrl+C pour quitter) :"
    $DOCKER_COMPOSE logs -f
fi
