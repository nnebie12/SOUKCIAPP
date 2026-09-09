#!/bin/bash

# Script de déploiement automatisé sur Vercel
# Utilisation: chmod +x deploy-vercel.sh && ./deploy-vercel.sh

echo "🚀 Début du déploiement SoukCI sur Vercel..."
echo ""

# Vérifier Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 Installation de Vercel CLI..."
    npm install -g vercel
fi

# Naviguer vers le dossier legal-pages
cd docs/legal-pages

echo "📁 Dossier courant: $(pwd)"
echo ""

# Lister les fichiers à déployer
echo "📄 Fichiers à déployer:"
ls -lah *.html vercel.json 2>/dev/null || echo "⚠️ Fichiers introuvables"
echo ""

# Déploiement
echo "⏳ Déploiement en cours..."
echo "Les étapes suivantes vont demander:"
echo "1. Connexion à Vercel (via GitHub)"
echo "2. Sélection du projet ou création"
echo "3. Configuration du domaine"
echo ""

vercel

echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "Prochaines étapes:"
echo "1. Assurez-vous que votre domaine soukci.app pointe vers Vercel"
echo "2. Attendez 24-48h pour propagation DNS"
echo "3. Testez les URLs:"
echo "   - https://soukci.app/legal/privacy"
echo "   - https://soukci.app/legal/data-rights"
echo "   - https://soukci.app/legal/delete-account"
