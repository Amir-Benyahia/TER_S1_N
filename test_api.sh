#!/bin/bash

# Script de tests automatisés pour l'API Maze Pacman
# Usage: ./test_api.sh [local|render]

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL de base et timeout selon l'environnement
if [ "$1" == "local" ]; then
    BASE_URL="http://localhost:3000"
    TIMEOUT="--max-time 30"
    echo -e "${YELLOW} Tests sur l'environnement LOCAL${NC}"
else
    BASE_URL="https://pacmaz-s1-n.onrender.com"
    TIMEOUT=""  # Pas de timeout pour Render (cold start peut être très long)
    echo -e "${YELLOW} Tests sur l'environnement RENDER (sans limite de temps)${NC}"
fi

API_URL="$BASE_URL/api"

echo ""
echo "========================================="
echo "  Tests API - Maze Pacman"
echo "  URL: $API_URL"
echo "========================================="
echo ""

# Compteurs
PASSED=0
FAILED=0

# Fonction pour tester un endpoint
test_endpoint() {
    local test_name=$1
    local url=$2
    local expected_status=$3
    
    echo -n "Test: $test_name ... "
    
    # Timeout dynamique selon l'environnement
    response=$(curl -s -w "\n%{http_code}" $TIMEOUT "$url")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d') 
    
    if [ "$http_code" == "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (Status: $http_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $http_code)"
        echo "Response: $body"
        ((FAILED++))
        return 1
    fi
}

# Test 1: Génération valide (10x8)
test_endpoint "Génération 10x8" \
    "$API_URL/generate?largeur=10&hauteur=8" \
    "200"

# Test 2: Génération minimale (3x3)
test_endpoint "Génération 3x3 (min)" \
    "$API_URL/generate?largeur=3&hauteur=3" \
    "200"

# Test 3: Génération maximale (50x50)
test_endpoint "Génération 50x50 (max)" \
    "$API_URL/generate?largeur=50&hauteur=50" \
    "200"

# Test 4: Largeur trop petite
test_endpoint "Validation largeur < 3" \
    "$API_URL/generate?largeur=2&hauteur=5" \
    "400"

# Test 5: Largeur trop grande
test_endpoint "Validation largeur > 50" \
    "$API_URL/generate?largeur=51&hauteur=10" \
    "400"

# Test 6: Hauteur trop petite
test_endpoint "Validation hauteur < 3" \
    "$API_URL/generate?largeur=10&hauteur=2" \
    "400"

# Test 7: Hauteur trop grande
test_endpoint "Validation hauteur > 50" \
    "$API_URL/generate?largeur=10&hauteur=51" \
    "400"

# Test 8: Paramètres par défaut
test_endpoint "Paramètres par défaut" \
    "$API_URL/generate" \
    "200"

# Test 9: Paramètres invalides
test_endpoint "Paramètres non numériques" \
    "$API_URL/generate?largeur=abc&hauteur=xyz" \
    "400"

# Test 10: Performance
echo -n "Test: Performance 30x30 ... "
start_time=$(date +%s.%N)
curl -s "$API_URL/generate?largeur=30&hauteur=30" > /dev/null
end_time=$(date +%s.%N)
duration=$(echo "$end_time - $start_time" | bc)

if (( $(echo "$duration < 5.0" | bc -l) )); then
    echo -e "${GREEN}✅ PASS${NC} (Temps: ${duration}s)"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} (Temps: ${duration}s > 5s)"
    ((FAILED++))
fi

# Résumé
echo ""
echo "========================================="
echo "  Résumé des tests"
echo "========================================="
echo -e "✅ Réussis: ${GREEN}$PASSED${NC}"
echo -e "❌ Échoués: ${RED}$FAILED${NC}"
echo "========================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les tests sont passés !${NC}"
    exit 0
else
    echo -e "${RED}❌  Certains tests ont échoué${NC}"
    exit 1
fi
