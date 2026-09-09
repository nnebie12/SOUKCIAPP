# Checklist Test sur Appareil - SoukCI

## Avant de tester

- [ ] Téléphone Android connecté à l'orateur
- [ ] Expo Go installé sur le téléphone
- [ ] `npm run dev` lancé
- [ ] Internet activé (WiFi ou données)

---

## ✅ Authentification

- [ ] **Registrer** : Remplir le formulaire complet
  - Email
  - Mot de passe
  - Nom complet
  - Téléphone
  
- [ ] **Login** : Se reconnecter avec nouvel compte

- [ ] **Logout** : Bouton logout fonctionne

- [ ] **Password reset** : Lien de récupération (optionnel)

---

## ✅ Accueil & Navigation

- [ ] **Écran Accueil** s'affiche (sans images cassées)
- [ ] **Tabs en bas** : Accueil, Explore, Favoris, Profil
- [ ] Navigation entre tabs fluide

---

## ✅ Exploration & Recherche

- [ ] **Explore** affiche les boutiques
- [ ] **Barre de recherche** responsive
- [ ] **Filtres** (catégorie, ville) fonctionnent
- [ ] **Localisation** OK ou fallback Abidjan
- [ ] Scroll/pagination pas de lag

---

## ✅ Fiche Boutique

- [ ] **Cliquer sur une boutique**
- [ ] **Détails affichés** : nom, adresse, horaires, avis
- [ ] **Système d'avis** : afficher les avis existants
- [ ] **Laisser un avis** : formulaire + envoi OK
- [ ] **Favoris** : bouton add/remove OK
- [ ] **Partager** WhatsApp : lien généré

---

## ✅ Panier & Commande

- [ ] **Ajouter au panier** depuis fiche boutique
- [ ] **Ouverture du CartDrawer**
- [ ] **Modifier quantités** (+/-)
- [ ] **Supprimer article** du panier
- [ ] **Aller au panier** (route /cart)
- [ ] **Créer commande** : formulaire complet
  - Adresse de livraison
  - Notes spéciales
  - Moyen de paiement (sélection)
  
- [ ] **Paiement Wave/Orange** : ouvre checkout CinetPay
- [ ] **Paiement Espèces** : sans promesse in-app

---

## ✅ Espace Commerçant

- [ ] **Créer une boutique** : formulaire OK
- [ ] **Tableau de bord** : affiche stats
- [ ] **Ajouter produits** : fonctionne
- [ ] **Demander Premium** : wording clair (sans activation auto)
- [ ] **Demander campagne** : validation manuelle mentionnée

---

## ✅ Compte & Légal

- [ ] **Profil** : affiche les infos
- [ ] **Modifier profil** : sauvegarde OK
- [ ] **Pages légales** : liens cliquables (URL soukci.app)
- [ ] **Motions sombre/clair** : bascule OK (si implémentée)

---

## ✅ Suppression de Compte

- [ ] **Settings > Supprimer compte** visible
- [ ] **Confirmation demandée** : 2x pour sécurité
- [ ] **Compte vraiment supprimé** : logout et new login échoue

---

## ✅ Réseau & Performance

- [ ] **App répond en 3G** (réduire throttle)
- [ ] **Offline gracieux** : message clair
- [ ] **Pas de crash** au lancement
- [ ] **Animations fluides** (60 FPS)

---

## ✅ Erreurs & Logs

Pendant le test, ouvrez les logs :

```bash
adb logcat | grep -E "CRASH|ERROR|WARN"
```

Vous devez voir :
- ✅ Aucun `FATAL`
- ⚠️ Warnings OK (dépreciations)
- ❌ Erreurs réseau si Supabase non configuré en dev

---

## Résultat du test

- [ ] **Toutes les cases cochées** → Prêt pour Play Store
- [ ] **Quelques erreurs** → Notez-les pour fix
- [ ] **Crash au démarrage** → Vérifier variables d'env

## Prochaine étape

Si tous les tests passent :
- ✅ Étape 3 (tests) = **TERMINÉE**
- ➡️ Passez à étape 4 : **Google Play Console setup**
