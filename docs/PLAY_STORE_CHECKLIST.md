# Checklist Play Store - SoukCI

## 1. Build Android

- [x] Identifiant Android configure: com.soukci.app
- [x] Build production EAS en AAB configure
- [x] versionCode present
- [ ] Generer un build release Android reel
- [ ] Installer et tester le build release sur appareil physique
- [ ] Verifier crash-free startup sans variables manquantes

## 2. Conformite produit

- [x] Suppression de compte disponible dans l'application
- [x] Fonction serveur de suppression de compte presente
- [x] Politique de confidentialite integree dans l'application
- [x] Les fallbacks mock sont desactives par defaut en production
- [x] Les parcours paiement/premium ont ete reformules pour ne pas promettre un traitement in-app inexistant
- [ ] Publier les pages legales publiques sur https://soukci.app
- [ ] Verifier publiquement les URLs privacy, data-rights et delete-account

## 3. Google Play Console

- [ ] Creer la fiche application definitive
- [ ] Ajouter icone 512x512 et visuels Play Store
- [ ] Rediger description courte et description longue conformes au produit reel
- [ ] Declarer la collecte de donnees selon docs/DATA_SAFETY.md
- [ ] Declarer l'usage de la localisation en mode approximatif/precis selon le comportement final
- [ ] Declarer la politique de suppression de compte avec URL publique fonctionnelle
- [ ] Completer la section App access si un compte de test est requis
- [ ] Completer la section Content rating
- [ ] Completer la section Data safety

## 4. Verification fonctionnelle release

- [ ] Authentification: inscription, connexion, deconnexion
- [ ] Creation de boutique sans donnees mock
- [ ] Accueil/explore sans contenu fictif en production
- [ ] Commande avec payment_status en pending et wording coherent
- [ ] Demande de campagne sans promesse de paiement in-app
- [ ] Ecran Premium sans activation auto
- [ ] Suppression de compte complete jusqu'au logout
- [ ] Gestion offline acceptable

## 5. Risques restants a fermer

- [ ] Domaine soukci.app resolvable publiquement
- [ ] Politique de confidentialite publique accessible sans erreur
- [ ] Page de suppression de compte publique accessible sans erreur
- [ ] Processus de support reel derriere privacy@soukci.app
- [ ] Strategie finale pour Premium/campagnes avant ouverture publique
- [ ] Strategie finale de paiement avant communication marketing plus ambitieuse

## Decision

SoukCI n'est pas pret pour une soumission Play Store publique tant que les cases externes ci-dessus ne sont pas fermees. Le code est maintenant plus coherent pour une beta interne ou une preproduction controlee.
