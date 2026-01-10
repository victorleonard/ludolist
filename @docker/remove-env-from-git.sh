#!/bin/bash

# Script pour retirer le fichier .env de git
# Ce script retire le fichier .env du suivi git sans le supprimer du disque

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
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

cd "$SCRIPT_DIR/../.."

# Vérifier que git est initialisé
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    error "Git n'est pas initialisé dans ce projet"
    exit 1
fi

ENV_FILE="@docker/.env"

# Vérifier si le fichier est suivi par git
if git ls-files --error-unmatch "$ENV_FILE" > /dev/null 2>&1; then
    warning "Le fichier $ENV_FILE est actuellement suivi par git."
    warning "Il va être retiré du suivi git (mais pas supprimé du disque)."
    echo ""
    read -p "Voulez-vous continuer ? (o/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        info "Retrait du fichier $ENV_FILE du suivi git..."
        git rm --cached "$ENV_FILE"
        success "Le fichier $ENV_FILE a été retiré du suivi git."
        info "Le fichier existe toujours sur le disque mais ne sera plus suivi par git."
        echo ""
        warning "⚠️  IMPORTANT : Si ce fichier a déjà été commité et poussé sur un dépôt distant,"
        warning "   vous devrez également le retirer de l'historique git avec :"
        warning "   git filter-branch ou git filter-repo (pour les versions récentes)"
        echo ""
        info "Pour vérifier que le fichier est bien ignoré :"
        echo "   git check-ignore -v $ENV_FILE"
    else
        info "Opération annulée."
    fi
else
    success "Le fichier $ENV_FILE n'est pas suivi par git."
    info "Vérification que le fichier est bien ignoré..."
    if git check-ignore -v "$ENV_FILE" > /dev/null 2>&1; then
        success "✅ Le fichier est bien ignoré par git."
    else
        warning "⚠️  Le fichier n'est pas ignoré. Vérifiez votre .gitignore"
    fi
fi
