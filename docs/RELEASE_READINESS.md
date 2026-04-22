# Release Readiness - SoukCI

Date de revue: 2026-04-06

## Ce qui a ete corrige dans le repo

- Le nom npm est maintenant valide en minuscules.
- Les ecrans coeur produit n'utilisent plus automatiquement les donnees mock en production.
- Les textes de paiement n'annoncent plus un paiement mobile traite dans l'application.
- L'activation Premium n'est plus basculee automatiquement depuis le tableau de bord commercant.
- L'ecran campagnes precise qu'il s'agit d'une validation manuelle, sans paiement in-app.
- Le README documente maintenant le comportement release et la preparation Play Store.
- Le plugin de build Sentry a ete retire de la config Expo pour eviter l'echec d'upload de sourcemaps tant que Sentry n'est pas configure cote organisation/projet.

## Ce qui reste hors du repo

- Publication du site https://soukci.app
- Publication et verification des pages legales publiques
- Configuration operationnelle de l'email privacy@soukci.app
- Build Android release final et verification sur appareil reel
- Remplissage effectif de la Play Console

## Niveau de preparation

- Beta interne: acceptable
- Test ferme: proche, sous reserve de pages legales publiques
- Production publique Play Store: non pret tant que les dependances externes ci-dessus ne sont pas fermees

## Validation technique au moment de la revue

- Typecheck: OK
- Tests contextes Auth/Cart: OK
- Lint: warnings non bloquants restants

## Warnings restants connus

- Hooks dependencies dans explore/favorites
- Quelques imports inutilises
- Un warning de style de type Array<T>

Ces warnings n'empechent pas une build, mais ils doivent idealement etre nettoyes avant une release large.
