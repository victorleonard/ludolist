#!/bin/bash

# Script de déploiement pour Ludolist
# Ce script automatise le déploiement de l'application avec Docker

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
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

info "Démarrage du déploiement de Ludolist..."

# 1. Vérifier les prérequis
info "Vérification des prérequis..."

if ! command -v docker &> /dev/null; then
    error "Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    error "Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Détecter la commande docker-compose
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

success "Docker et Docker Compose sont installés"

# 2. Créer la structure de dossiers pour les données
info "Création de la structure de dossiers pour les données..."

DATA_DIR="../@data/ludolist"
DB_DIR="$DATA_DIR/db"
UPLOADS_DIR="$DATA_DIR/uploads"

mkdir -p "$DB_DIR"
mkdir -p "$UPLOADS_DIR"

# Définir les permissions (755 pour les dossiers)
chmod 755 "$DATA_DIR" 2>/dev/null || true
chmod 755 "$DB_DIR" 2>/dev/null || true
chmod 755 "$UPLOADS_DIR" 2>/dev/null || true

success "Structure de dossiers créée : $DATA_DIR"

# 3. Gérer le fichier .env
info "Vérification du fichier .env..."

ENV_FILE=".env"
TEMPLATE_FILE="env.template"

if [[ ! -f "$ENV_FILE" ]]; then
    warning "Le fichier .env n'existe pas. Création depuis le template..."
    cp "$TEMPLATE_FILE" "$ENV_FILE"
    
    # Générer les secrets si nécessaire
    info "Génération des secrets Strapi..."
    
    generate_secret() {
        openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64
    }
    
    # Remplacer les valeurs par défaut par des secrets générés
    if grep -q "your-app-keys-here" "$ENV_FILE"; then
        APP_KEYS=$(generate_secret)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|APP_KEYS=your-app-keys-here|APP_KEYS=$APP_KEYS|g" "$ENV_FILE"
        else
            # Linux
            sed -i "s|APP_KEYS=your-app-keys-here|APP_KEYS=$APP_KEYS|g" "$ENV_FILE"
        fi
    fi
    
    # Générer les autres secrets
    SECRETS=(
        "API_TOKEN_SALT:your-api-token-salt-here"
        "ADMIN_JWT_SECRET:your-admin-jwt-secret-here"
        "TRANSFER_TOKEN_SALT:your-transfer-token-salt-here"
        "JWT_SECRET:your-jwt-secret-here"
    )
    
    for secret_pair in "${SECRETS[@]}"; do
        IFS=':' read -r secret_name secret_placeholder <<< "$secret_pair"
        if grep -q "$secret_placeholder" "$ENV_FILE"; then
            SECRET_VALUE=$(generate_secret)
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s|${secret_name}=${secret_placeholder}|${secret_name}=${SECRET_VALUE}|g" "$ENV_FILE"
            else
                sed -i "s|${secret_name}=${secret_placeholder}|${secret_name}=${SECRET_VALUE}|g" "$ENV_FILE"
            fi
        fi
    done
    
    warning "Fichier .env créé avec des secrets générés."
    warning "⚠️  IMPORTANT : Vérifiez et modifiez le fichier .env si nécessaire avant de continuer."
    echo ""
    read -p "Appuyez sur Entrée pour continuer ou Ctrl+C pour annuler..."
else
    success "Le fichier .env existe déjà"
    
    # Vérifier si les secrets sont configurés
    if grep -q "your-app-keys-here\|your-api-token-salt-here\|your-admin-jwt-secret-here" "$ENV_FILE"; then
        warning "Certains secrets dans .env utilisent encore les valeurs par défaut."
        warning "Veuillez les modifier avant de continuer."
        read -p "Appuyez sur Entrée pour continuer ou Ctrl+C pour annuler..."
    fi
fi

# 4. Vérifier que les variables essentielles sont définies
info "Vérification des variables d'environnement essentielles..."

source "$ENV_FILE" 2>/dev/null || true

if [[ -z "$APP_KEYS" ]] || [[ "$APP_KEYS" == "your-app-keys-here" ]]; then
    error "APP_KEYS n'est pas défini dans .env"
    exit 1
fi

success "Variables d'environnement vérifiées"

# 5. Vérifier les ports et arrêter uniquement les conteneurs ludolist
info "Vérification des ports et des conteneurs existants..."

# Charger les variables d'environnement pour connaître les ports
source "$ENV_FILE" 2>/dev/null || true
BACKEND_PORT="${BACKEND_PORT:-1338}"
FRONTEND_PORT="${FRONTEND_PORT:-3001}"

# Vérifier si les ports sont déjà utilisés par d'autres conteneurs Docker
check_port_docker() {
    local port=$1
    local service=$2
    # Vérifier si un conteneur Docker utilise ce port (sauf les conteneurs ludolist)
    if docker ps --format '{{.Names}}\t{{.Ports}}' 2>/dev/null | grep -v "^ludolist-" | grep -q ":$port->" 2>/dev/null; then
        warning "Le port $port semble être utilisé par un autre conteneur Docker."
        warning "Si c'est un conflit, modifiez ${service}_PORT dans .env"
    fi
}

check_port_docker "$BACKEND_PORT" "BACKEND"
check_port_docker "$FRONTEND_PORT" "FRONTEND"

# Arrêter uniquement les conteneurs ludolist (définis dans ce docker-compose.yml)
# Note: docker-compose down n'affecte que les conteneurs définis dans ce fichier docker-compose.yml
info "Arrêt des conteneurs ludolist existants (s'il y en a)..."
info "Note: Les autres conteneurs Docker ne seront pas affectés."
$DOCKER_COMPOSE down 2>/dev/null || true

# 6. Construire les images
info "Construction des images Docker..."
$DOCKER_COMPOSE build --no-cache

success "Images construites avec succès"

# 7. Démarrer les conteneurs
info "Démarrage des conteneurs..."
$DOCKER_COMPOSE up -d

success "Conteneurs démarrés"

# 8. Attendre que les services soient prêts
info "Attente du démarrage des services..."
sleep 5

# Vérifier l'état des conteneurs
info "Vérification de l'état des conteneurs..."
$DOCKER_COMPOSE ps

# 9. Afficher les informations de connexion
echo ""
success "=========================================="
success "Déploiement terminé avec succès !"
success "=========================================="
echo ""
info "Accès à l'application :"
echo "  - Frontend : http://localhost:${FRONTEND_PORT:-3001}"
echo "  - Backend (Strapi Admin) : http://localhost:${BACKEND_PORT:-1338}/admin"
echo ""
info "Données stockées dans :"
echo "  - Base de données : $DB_DIR"
echo "  - Uploads : $UPLOADS_DIR"
echo ""
info "Commandes utiles :"
echo "  - Voir les logs : $DOCKER_COMPOSE logs -f"
echo "  - Arrêter : $DOCKER_COMPOSE down"
echo "  - Redémarrer : $DOCKER_COMPOSE restart"
echo ""
