# 📋 Google Play Console Setup - SoukCI

**Temps estimé : 30-45 minutes**

---

## Prérequis

- [ ] Compte Google (gmail)
- [ ] Accès à Google Play Console
- [ ] Paiement de $25 USD (frais d'inscription unique) - via carte master/visa
- [ ] Logo/icône 512x512 PNG
- [ ] Screenshots (min 2, max 8) de l'app
- [ ] Titre et description de l'app
- [ ] Email pour support : privacy@soukci.app

---

## Étape 1️⃣ : Créer le compte Play Console

### 1.1 Aller à Google Play Console

Allez à : https://play.google.com/console

### 1.2 Créer un compte développeur

Si c'est votre première fois :
- Cliquez "Sign up now"
- Sélectionnez "Individual" ou "Organization"
- Remplissez le formulaire
- Payez les frais de $25 USD (carte de crédit requise)

---

## Étape 2️⃣ : Créer une nouvelle app

### 2.1 Dashboard Play Console

- Cliquez **"Create app"** (bouton bleu en haut à droite)

### 2.2 Détails de base

Remplissez :

| Champ | Valeur |
|-------|--------|
| **App name** | SoukCI |
| **Default language** | Français (FR) |
| **App or game** | App |
| **Free or paid** | Free (Gratuit) |
| **Declarations** | ✓ Coche toutes les déclarations |

Cliquez **"Create app"**

---

## Étape 3️⃣ : Informations produit

### 3.1 Aller à "Store listing"

Dans le menu gauche → **Store listing**

### 3.2 Remplir les champs de base

#### **App title** (max 50 caractères)
```
SoukCI - Découvrez les Boutiques
```

#### **Short description** (max 80 caractères)
```
Trouvez les meilleures boutiques près de vous.
```

#### **Full description** (max 4000 caractères)

Copiez-collez depuis le README :

```
SoukCI est la plateforme complète pour découvrir, 
comparer et choisir où faire vos achats en Côte d'Ivoire.

POUR LES ACHETEURS:
- Recherche avancée par catégorie, ville, produit
- Géolocalisation pour trouver les boutiques proches
- Fiches détaillées avec photos, horaires, avis
- Système d'évaluation et de notation
- Sauvegardez vos boutiques préférées
- Partage via WhatsApp

POUR LES COMMERÇANTS:
- Inscription gratuite et création de vitrine
- Tableau de bord pour gérer produits et promotions
- Statistiques de visites et clics
- Demande de mise en avant Premium
- Gestion des campagnes promotionnelles

PAIEMENTS ACCEPTÉS:
- Wave, Orange Money, MTN Money
- Espèces (hors ligne avec commerçant)

VERSION ACTUELLE:
v1.0.0 - MVP (Minimum Viable Product)

À PROPOS DE LA SÉCURITÉ:
- Authentification sécurisée Supabase
- Chiffrement HTTPS obligatoire
- Row Level Security en base de données
- Suppression de compte totale garantie

[Visitez https://soukci.app pour plus d'infos]
```

#### **Privacy policy** (URL)
```
https://soukci.app/legal/privacy
```

#### **Contact email**
```
privacy@soukci.app
```

### 3.3 Catégorie

**Category** → Choisir : **Shopping**

---

## Étape 4️⃣ : Graphiques & Visuels

### 4.1 Icon (icône app)

- Téléchargez votre logo 512×512 PNG
- Doit avoir un carré transparent/uni
- Ne mettez pas de texte (trop petit sur home)

### 4.2 Feature graphic (bannière)

- Taille : 1024 × 500 pixels
- PNG ou JPG
- Résume visuellement l'app
- Exemple texte: "SoukCI - Découvrez les Boutiques"

### 4.3 Screenshots

Minimum 2, maximum 8 : 1080 × 1920 pixels (format portrait)

**Recommandés :**

1. **Accueil** - Liste de boutiques
2. **Détail boutique** - Avis et description
3. **Recherche/Filtres** - Fonctionnalité clé
4. **Panier** - Commerce en ligne
5. **Profil commerçant** - Si relevant

**Conseil** : Utilisez des tools comme Figma ou Adobe XD pour ajouter du texte :
```
"Découvrez boutiques près de vous" (sur screenshot 1)
"Consultez avis et notes" (sur screenshot 2)
```

### 4.4 Vidéo promo (optionnel)

- Max 30 secondes
- Format MP4 ou WebM
- Portrait ou landscape (16:9)
- Include on Play Store listing checkbox

---

## Étape 5️⃣ : Content rating

### 5.1 Aller à "Content rating"

Menu gauche → **Content rating**

### 5.2 Questionnaire

Répondez sincèrement :

| Question | Réponse | Raison |
|----------|---------|--------|
| Violence | No | App de shopping |
| Langage | No | Interface en français standard |
| Contenu approprié | Select none | Shopping seulement |
| Collecte de données | Yes | Authentification + localisation |
| Données personnelles | Yes | Email, téléphone, localisation |
| Données financières | Yes | Paiements mobiles déclarés |

Cliquez **"Save questionnaire"**

---

## Étape 6️⃣ : Data Safety

### 6.1 Aller à "Data safety"

Menu gauche → **Data safety**

### 6.2 Déclarer les données

**Question 1 : "Does this app collect or share personal data?"**
→ **YES**

**Question 2 : Data types collected**

Cocher :
- ✅ **Contact info** → Name, Email, Phone
- ✅ **Location** → Approximate & Precise
- ✅ **Purchases** → Transaction history
- ✅ **User IDs** → For authentication
- ✅ **App activity** → Search history, favorites

**Question 3 : How is data collected?**
- ✅ **Collected automatically**
- ✅ **Data provided by user** (registration, orders)

**Question 4 : Encryption in transit**
→ **YES** (all HTTPS)

**Question 5 : Data deletion**
→ **YES** (available in app & on website)
- URL: `https://soukci.app/legal/delete-account`

**Question 6 : Third-party sharing**
→ **YES**
- Supabase (database & auth)
- CinetPay (payment processing)
- RevenueCat (Premium subscriptions)
- Sentry (diagnostics) - if enabled

**Question 7 : Data retention**
```
- Logs: 30 days
- Order history: 2 years
- Personal profile: Until account deletion
- After deletion: Data anonymous after 30-90 days
```

Cliquez **"Save"**

---

## Étape 7️⃣ : Configuration de version (Build upload)

### 7.1 Aller à "App releases"

Menu gauche → **Testing** → **Internal Testing** (ou **Open Testing**)

### 7.2 Créer un release

Cliquez **"Create new release"**

### 7.3 Upload AAB

Quand votre build EAS est prêt :

1. Récupérez le fichier `app-release.aab`
2. Drag & drop dans Play Console OU
3. Cliquez "Browse files" et sélectionnez l'AAB

### 7.4 Remplir les champs

| Champ | Valeur |
|-------|--------|
| **Version name** | 1.0.0 |
| **Release notes** | v1.0.0 - MVP Launch |
| **Status** | Draft (avant soumission) |

Cliquez **"Save"**

---

## Étape 8️⃣ : Préparation à la soumission

### 8.1 Checklist avant soumission

Avant d'appuyer sur "Submit for review" :

- [ ] App title + description remplis
- [ ] Contact email valide (privacy@soukci.app)
- [ ] Icon 512×512 uploadé
- [ ] Min 2 screenshots uploadés
- [ ] Feature graphic 1024×500 uploadé
- [ ] Privacy policy URL en ligne et accessible
- [ ] Delete account URL fonctionnelle
- [ ] Content rating complété
- [ ] Data safety déclaré
- [ ] AAB téléchargé et valide
- [ ] Version name = 1.0.0
- [ ] Pas d'erreurs de conformité affichées

### 8.2 Soumettre pour review

1. Allez à **"App releases"** → Votre release
2. Cliquez **"Review"** (en haut)
3. Lisez les avertissements
4. Cliquez **"Submit for review"**

**Google va revérifier** en 48-72h. L'app doit être :
- ✅ Fonctionne sans erreurs
- ✅ Pas de données sensibles en clair
- ✅ Respecte les politiques Google Play

---

## Étape 9️⃣ : Après approbation

### 9.1 L'app est en ligne 🎉

Quand Google valide :
- [ ] App disponible sur Play Store
- [ ] URL: `https://play.google.com/store/apps/details?id=com.soukci.app`
- [ ] Compteur de téléchargements qui augmente

### 9.2 Suivi des téléchargements

Menu gauche → **Acquisition** → **Overview**
- Voir téléchargements en temps réel
- Crashes et ratings
- Démographie des users

---

## Troubleshooting

### ❌ "App not installable"

La version cible SDK est trop basse. Vérifier dans `app.json` :

```json
{
  "expo": {
    "android": {
      "targetSdkVersion": 34    // ← Doit être ≥ 34 (2024)
    }
  }
}
```

### ❌ "Violates Google policies"

Causes courantes :
- Promesses de paiement in-app non tenues
- Données sensibles non suffisamment protégées
- Description trompeuse

**Solution** : Vérifiez que votre app matches la description (pas de "Premium in-app unblocker" etc.)

### ❌ "Rejeté pour collecte de données"

→ **Vérifiez que `vercel.json` avec URLs légales est déployé**

Play Store veut vraiment voir :
✅ `https://soukci.app/legal/privacy` (accessible)
✅ `https://soukci.app/legal/delete-account` (fonctionnel)

### ❌ "Rejeté pour paiements"

→ Vérifiez que les parcours de paiement sont déclarés correctement et que vous **n'exigez pas** de paiement in-app que vous ne supportez pas.

---

## Temps estimé total

| Étape | Temps |
|-------|-------|
| 1. Créer compte + frais | 5 min |
| 2. Créer app | 2 min |
| 3. Info produit | 10 min |
| 4. Visuels (icon, screenshots) | 15-30 min |
| 5. Content rating | 2 min |
| 6. Data safety | 5 min |
| 7. Upload build | 5 min |
| 8. Submit | 2 min |
| **TOTAL** | **~45 min** |

---

## Après complétude Google Play Console

✅ Checklist Étape 4 completed
⏳ Attendez approval de Google (48-72h)
➡️ L'app reste gratuite, promotion optionnelle

Besoin d'aide ? Posez une question ou revérifiez ce checklist.
