# Android Release Build - SoukCI

Date: 2026-04-06

## Etat de l'environnement local

- EAS CLI disponible
- Session EAS authentifiee
- JDK disponible
- ANDROID_HOME non configure localement
- ANDROID_SDK_ROOT non configure localement

Conclusion:
- Les builds Android locaux ne sont pas prets sur cette machine
- Les builds cloud EAS sont la voie recommandee ici

## Verification configuration

- Expo Doctor: OK
- Lint: OK
- Typecheck: OK
- Tests Auth/Cart: OK

## Assets verifies

- icon.png: 2048 x 2048
- adaptive-icon.png: 2048 x 2048
- splash-icon.png: 2484 x 4872
- favicon.png: 512 x 512

## Premier build cloud

- Build ID: b0b9ce50-acb3-41ce-9478-f88998949665
- Statut: errored
- Cause racine identifiee: tache Sentry d'upload des assets JS
- Message utile extrait du log:
  - error: An organization ID or slug is required (provide with --org)
  - Execution failed for task ':app:createBundleReleaseJsAndAssets_SentryUpload_com.soukci.app@1.0.0+1_1'

Action appliquee:
- Retrait du plugin @sentry/react-native de la config Expo pour ne pas bloquer la build tant que Sentry release n'est pas configure cote org/projet.

## Second build cloud

- Build ID: a1aa7672-3254-45e7-90f0-3f155fb3269e
- Statut lors de la revue: IN_PROGRESS
- URL logs: https://expo.dev/accounts/dianekassis-organization/projects/soukci/builds/a1aa7672-3254-45e7-90f0-3f155fb3269e

## Recommandations immediates

- Laisser tourner le second build jusqu'au resultat final
- Si la build reussit, publier d'abord sur le track internal testing
- Si elle echoue encore, extraire le log du phase Run gradlew et traiter la prochaine cause concrete
- Reconfigurer Sentry plus tard avec org, project et auth token si l'upload de sourcemaps devient necessaire
