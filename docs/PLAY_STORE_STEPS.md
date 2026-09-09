# Guide Complet : 5 Étapes pour Play Store

## État d'avancement

- ✅ **Étape 1** : Build Android lancé (en cours, ~15-20 min)
- ✅ **Étape 2** : Pages légales créées (`docs/legal-pages/`)
- ⏳ **Étape 3** : Tester sur appareil physique
- ⏳ **Étape 4** : Google Play Console
- ⏳ **Étape 5** : Data Safety declaration

---

## ÉTAPE 1 : Générer le build Android ✅

**Commande exécutée :**
```bash
eas build --platform android --profile production
```

**Statut :** En cours (terminal ID: 7b9290d1-70b0-45cd-a1ca-dd6335ac483b)

**Prochaines étapes quand le build est terminé :**
1. Récupérez le lien de téléchargement de l'APK/AAB
2. Téléchargez-le sur votre ordinateur
3. Passez à l'Étape 3

---

## ÉTAPE 2 : Pages Légales ✅

**3 fichiers HTML générés :**
- `docs/legal-pages/privacy.html` → https://soukci.app/legal/privacy
- `docs/legal-pages/data-rights.html` → https://soukci.app/legal/data-rights
- `docs/legal-pages/delete-account.html` → https://soukci.app/legal/delete-account

**À faire maintenant :**
1. Hébergez votre site `soukci.app` (Vercel, Netlify, etc.)
2. Copiez les 3 fichiers HTML dans le répertoire `/legal/` de votre site
3. Testez que chaque URL est accessible

**Exemple de structure :**
```
soukci.app/
├── index.html
├── legal/
│   ├── privacy.html
│   ├── data-rights.html
│   └── delete-account.html
```

---

## ÉTAPE 3 : Tester sur Appareil Physique ⏳

### 3.1 Installer l'APK/AAB

Une fois le build terminé :

```bash
# Si vous avez le lien AAB, téléchargez-le
# Ou utilisez ADB pour installer directement depuis EAS

adb install app-release.aab  # Si AAB local
```

**Alternative : Utiliser Google Play Console (internal testing)**
1. Allez à Google Play Console → Votre app
2. Dans "Internal Testing", chargez l'AAB
3. Ajoutez votre compte Google au programme de test
4. Téléchargez via Play Store (privé)

### 3.2 Tests critiques à faire

Checklist fonctionnelle :

- [ ] Authentification
  - [ ] Inscription (nouveau compte)
  - [ ] Connexion
  - [ ] Déconnexion
  - [ ] Récupération de mot de passe

- [ ] Accueil & Exploration
  - [ ] Affichage des boutiques (sans données mock)
  - [ ] Recherche et filtres
  - [ ] Localisation activée/désactivée

- [ ] Boutique
  - [ ] Consulter détail boutique
  - [ ] Laisser un avis
  - [ ] Ajouter aux favoris
  - [ ] Partager via WhatsApp

- [ ] Panier & Commande
  - [ ] Ajouter un produit au panier
  - [ ] Modifier quantités
  - [ ] Commande créée avec statut "pending"

- [ ] Paiement
  - [ ] Wave checkout ouvert in-app
  - [ ] Orange Money checkout ouvert
  - [ ] Mode espèces sans promesse de paiement

- [ ] Commerçant
  - [ ] Créer boutique
  - [ ] Ajouter produits
  - [ ] Accéder au tableau de bord
  - [ ] Demander Premium (sans activation auto)
  - [ ] Soumettre demande campagne

- [ ] Compte & Légal
  - [ ] Accéder aux pages légales (si URLs pub en place)
  - [ ] Supprimer compte → vraie suppression

- [ ] Réseau
  - [ ] App fonctionne en 3G
  - [ ] Pas de plantage en offline

### 3.3 Vérifier absence de crash

- Activez les logs : `adb logcat` pendant l'utilisation
- Recherchez des traces "CRASH" ou "FATAL"
- L'app doit redémarrer sans erreur

---

## ÉTAPE 4 : Google Play Console ⏳

### 4.1 Créer la fiche app

1. Allez à [Google Play Console](https://play.google.com/console)
2. **Créer une app**
   - Nom: "SoukCI"
   - Catégorie: Shopping
   - Type: App gratuite

### 4.2 Informations produit

Remplissez :

| Section | Contenu |
|---------|---------|
| **Title** | SoukCI - Découvrez les Boutiques |
| **Short description** | Trouvez les meilleures boutiques près de vous. Avis, comparaisons et livraison. |
| **Full description** | (Copier du README) |
| **Category** | Shopping |
| **Contact email** | privacy@soukci.app |
| **Privacy policy** | https://soukci.app/legal/privacy |
| **Delete account URL** | https://soukci.app/legal/delete-account |

### 4.3 Visuels Play Store

Téléchargez :
- **Icon** (512×512, PNG)
- **Feature graphic** (1024×500, PNG résumant l'app)
- **Screenshots** (min 2, max 8)
  - Accueil
  - Détail boutique
  - Panier
  - Profil commerçant
- **Video** (trailer 30s, optionnel)

### 4.4 Contenu rating

Complétez le formulaire de contenu :
- Données personnelles : Oui (authentification)
- Localisation : Oui (approximative/précise)
- Paiements : Oui (mobile money)

### 4.5 Data Safety

(Voir ÉTAPE 5)

### 4.6 Configuration de version

- **Chargez l'AAB** généré à l'étape 1
- **Version name** : "1.0.0"
- **Version code** : (auto-incrément)
- **Target API** : Vérifier que c'est ≥ 34 (nov 2024)

---

## ÉTAPE 5 : Data Safety Declaration ⏳

### 5.1 Données déclarées

Basé sur `docs/DATA_SAFETY.md`, remplissez le formulaire Play Console :

| Donnée | Collectée | Partagée | Chiffrée |
|--------|-----------|----------|----------|
| Nom complet | Oui | Non (Supabase) | Oui |
| Email | Oui | Non (Supabase) | Oui |
| Téléphone | Oui | Non (Supabase) | Oui |
| Localisation | Oui (si approuvée) | Non | Oui |
| Historique commandes | Oui | Non | Oui |
| Avis & notes | Oui | Non | Oui |
| Diagnostic (Sentry) | Oui* | Oui (si activé) | Oui |

**\* Sentry = uniquement si variable d'env configurée**

### 5.2 Politiques

- **Suppression de compte** : Disponible (https://soukci.app/legal/delete-account)
- **Accès aux données** : Disponible (https://soukci.app/legal/data-rights)
- **Rétention** : 30j logs, 2ans commandes, infini jusqu'à suppression pour profil

### 5.3 Tiers & permissions

Déclarez :
- Supabase (auth, DB)
- CinetPay (paiements, le cas échéant)
- RevenueCat (Premium billing)
- Sentry (diagnostics, si activé)

---

## Checklist finale avant soumission

- [ ] Build AAB généré et testé
- [ ] Pages légales en ligne sur soukci.app
- [ ] Data Safety complétée dans Play Console
- [ ] Screenshots et icones uploadés
- [ ] Description produit complète
- [ ] Email privacy@soukci.app fonctionnel
- [ ] Pas d'erreur de démarrage (crash-free)
- [ ] Toutes les routes sans données mock en production
- [ ] Tests fonctionnels passés sur appareil physique

---

## Contacts support

- **Google Play** : https://support.google.com/googleplay
- **SoukCI Privacy** : privacy@soukci.app
- **Sentry Config** : ../README.md (pour plugin sourcemaps)
