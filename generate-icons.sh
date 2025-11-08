#!/bin/bash

# Script pour générer toutes les icônes PWA à partir du logo Fitmos.png

echo "🎨 Génération des icônes PWA pour Fitmos..."

# Vérifier si ImageMagick est installé
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick n'est pas installé. Installation..."
    brew install imagemagick
fi

cd "$(dirname "$0")"
SOURCE_IMAGE="src/assets/Fitmos.png"
OUTPUT_DIR="src/assets/icons"

# Créer le dossier icons s'il n'existe pas
mkdir -p "$OUTPUT_DIR"

# Tailles pour Android et navigateurs
sizes=(16 32 72 96 128 144 152 192 384 512)

echo "📱 Génération des icônes..."
for size in "${sizes[@]}"; do
    magick "$SOURCE_IMAGE" -resize ${size}x${size} "$OUTPUT_DIR/icon-${size}x${size}.png"
    echo "✓ icon-${size}x${size}.png"
done

# Icône spéciale pour iOS (180x180)
magick "$SOURCE_IMAGE" -resize 180x180 "$OUTPUT_DIR/apple-touch-icon.png"
echo "✓ apple-touch-icon.png (180x180)"

# Splash screen iOS (1125x2436 pour iPhone X)
magick "$SOURCE_IMAGE" -resize 512x512 -background "#1a1a1a" -gravity center -extent 1125x2436 "$OUTPUT_DIR/apple-splash.png"
echo "✓ apple-splash.png (1125x2436)"

echo "✅ Toutes les icônes ont été générées avec succès!"
echo "📂 Emplacement: $OUTPUT_DIR"
