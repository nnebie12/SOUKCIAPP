# 🚀 Déployer soukci.app sur Vercel

## Option 1 : Déploiement Simple (Recommandé) ⭐

### Étapes

1. **Préparez les fichiers**
   ```bash
   cd docs/legal-pages
   ```
   
   Vérifiez que vous avez :
   - `index.html` (page d'accueil)
   - `privacy.html` (politique de confidentialité)
   - `data-rights.html` (droits utilisateur)
   - `delete-account.html` (suppression de compte)

2. **Créez un GitHub repo pour votre site légal** (optionnel mais recommandé)
   ```bash
   git init
   git add .
   git commit -m "Initial legal pages"
   remote add origin https://github.com/nnebie12/soukci-legal.git
   git push -u origin main
   ```

3. **Allez sur [Vercel.com](https://vercel.com)**
   - Connectez-vous avec GitHub (gratuit)
   - Cliquez "New Project"
   - Sélectionnez `soukci-legal` (ou importez via URL)

4. **Configurez le domaine**
   - Dans Vercel, allez à "Settings > Domains"
   - Ajoutez votre domaine `soukci.app`
   - Suivez les instructions DNS

5. **Routes automatiques**
   Vercel exposera :
   - `https://soukci.app/` → index.html
   - `https://soukci.app/privacy.html` → privacy.html
   - `https://soukci.app/legal/privacy` ← (besoin config ci-dessous)

---

## Option 2 : Routes personnalisées (https://soukci.app/legal/privacy) 

Pour avoir les URLs exactes du README, créez `vercel.json` :

```json
{
  "rewrites": [
    { "source": "/legal/privacy", "destination": "/privacy.html" },
    { "source": "/legal/data-rights", "destination": "/data-rights.html" },
    { "source": "/legal/delete-account", "destination": "/delete-account.html" }
  ]
}
```

Ajoutez ce fichier dans `docs/legal-pages/` avant de déployer.

---

## Option 3 : Depuis GitHub Copilot (Direct)

```bash
# 1. Installez Vercel CLI
npm install -g vercel

# 2. Déployez
cd docs/legal-pages
vercel

# Suivez les prompts pour domaine et config
```

---

## Vérification post-déploiement ✅

Une fois déployé, testez chaque URL :

```bash
# Test 1 : Accueil
curl https://soukci.app/

# Test 2 : Politique de confidentialité
curl https://soukci.app/legal/privacy

# Test 3 : Droits utilisateur
curl https://soukci.app/legal/data-rights

# Test 4 : Suppression de compte
curl https://soukci.app/legal/delete-account
```

Chaque URL doit retourner du HTML (pas erreur 404).

---

## Coûts ✨

- **Vercel gratuit** : Inclus
- **Domaine** : À partir de $10/an chez Namecheap ou Google Domains
- **DNS** : Gratuit chez Vercel ou votre registrar

---

## Troubleshooting

### Erreur 404 sur /legal/privacy
→ Vérifiez que `vercel.json` est dans le dossier déployé

### Domaine ne pointe pas
→ Attendez 24-48h pour propagation DNS

### Pages HTML non stylisées
→ Vercel sert correctement le CSS inline, actualisez le navigateur (Ctrl+Shift+Del)

---

## Prochaines étapes

Une fois ces 3 URLs en ligne :
1. ✅ Étape 2 (déploiement) = **TERMINÉE**
2. ➡️ Passez à l'étape 3 : **Tests sur appareil**
