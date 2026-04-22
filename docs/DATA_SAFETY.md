# Data Safety - SoukCI

Ce document sert de base de travail pour la declaration Google Play Data safety. Il ne remplace pas une revue juridique finale.

## Donnees traitees par l'application

### Identifiants et informations de compte

- Nom complet
- Adresse email
- Numero de telephone
- Statut commercant

Sources:
- user_profiles
- auth.users

## Activite utilisateur

- Favoris
- Avis et notes
- Historique de commandes
- Reponses commerçant sur avis
- Historique de campagnes

## Informations commerciales et transactionnelles

- Adresse de livraison
- Notes de commande
- Moyen de reglement souhaite
- Statut de paiement
- Produits commandes

Important:
- Le paiement n'est pas traite directement in-app a ce stade.
- Les champs de paiement stockent une preference/metadonnees de workflow, pas une transaction mobile money finalisee par l'application.

## Localisation

- Localisation precise ou approximative demandee pour afficher les boutiques proches.
- Fallback local sur Abidjan si la permission est refusee ou indisponible.

## Diagnostics

- Sentry est initialise si EXPO_PUBLIC_SENTRY_DSN est configure.
- Les evenements peuvent inclure des donnees techniques de crash et de performance.

## Partage avec des tiers

- Supabase: authentification, base de donnees, fonctions serveur
- Sentry: monitoring et crash reporting, uniquement si configure

## Points a verifier avant declaration Play Console

- Verifier exactement quelles donnees Sentry recoit en production
- Verifier si les adresses de livraison sont exportees ou seulement conservees cote Supabase
- Verifier la retention reelle des donnees de suppression de compte et d'audit
- Verifier si la localisation est indispensable sur tous les parcours ou seulement certains ecrans
- Verifier si des captures de logs contiennent des donnees personnelles

## Position de declaration recommandee

- Donnees collectees: oui
- Donnees partagees: potentiellement oui pour diagnostics si Sentry est actif
- Chiffrement en transit: oui
- Suppression de compte: oui, dans l'application et via URL publique prevue

## Blocages externes

- La politique de confidentialite publique doit etre en ligne et coherente avec cette cartographie
- La page de suppression de compte publique doit etre accessible avant soumission
