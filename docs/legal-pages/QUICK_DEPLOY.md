# 🚀 Déployer en 5 minutes sur Vercel

## Méthode 1 : Script automatisé (Recommandé)

```bash
cd /Users/kassinnebie/Downloads/SOUKCIAPP
chmod +x docs/legal-pages/deploy-vercel.sh
docs/legal-pages/deploy-vercel.sh
```

Le script va :
1. ✅ Installer Vercel CLI
2. ✅ Vous demander de vous connecter (GitHub)
3. ✅ Sélectionner/créer le projet
4. ✅ Déployer les 4 fichiers HTML

---

## Méthode 2 : CLI manuelle (5 commandes)

```bash
# 1. Installer Vercel
npm install -g vercel

# 2. Naviguer au dossier
cd /Users/kassinnebie/Downloads/SOUKCIAPP/docs/legal-pages

# 3. Déployer
vercel

# 4. Suivre les prompts:
# - Connectez-vous avec GitHub
# - Créez nouveau projet "soukci-legal"
# - Acceptez les settings par défaut

# 5. Testez
curl https://soukci.app/legal/privacy
```

---

## Après le déploiement

### ✅ Vérifier que c'est en ligne

```bash
# Testez chaque page
curl -I https://soukci.app/legal/privacy
# Doit retourner: HTTP/2 200

curl -I https://soukci.app/legal/data-rights
curl -I https://soukci.app/legal/delete-account
```

### ✅ Si URLs ne fonctionnent pas

**Problème 1: Domaine ne pointe pas**
- Attendez 24-48h pour DNS propagation
- Ou manuellement mettre à jour DNS chez votre registrar vers Vercel nameservers

**Problème 2: 404 sur /legal/privacy**
- Vérifiez que `vercel.json` est dans le dossier déployé
- Re-déployez: `vercel --prod`

**Problème 3: Pages non stylisées**
- Refresh: Ctrl+Shift+Suppr cache
- Le CSS inline peut prendre du temps

---

## Étape suivante

Une fois déployé ET URLs testées ✅:
➡️ Passez à **ÉTAPE 3 : Tester en DEV**
