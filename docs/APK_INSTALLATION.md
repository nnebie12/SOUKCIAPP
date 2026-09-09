# Installation & Test APK sur Appareil Android

## Prérequis

- Android phone (SDK 24+)
- USB cable
- `adb` installé sur Mac
  ```bash
  # Si pas installed:
  brew install android-platform-tools
  ```
- USB debugging activé sur téléphone
  - Settings → Developer options → USB Debugging ON

---

## Étape 1 : Téléchargement de l'APK/AAB

### Option A : Build EAS AAB (depuis Google Play Console)

```bash
# Allez sur https://expo.dev/accounts/dianekassis-organization/projects/soukci/builds/

# Cliquez sur votre build Android (production)
# Téléchargez l'URL ou utilisez :

curl -O https://[url-du-build-eas]
```

### Option B : APK local (test apk, non release)

```bash
# Si vous avez generé localement :
ls -lah app-release.aab app-release.apk
```

---

## Étape 2 : Installation sur téléphone

### Via ADB (rapide)

```bash
# Connectez le téléphone en USB

# Vérifiez la connexion
adb devices
# Doit afficher : xxxxxxx     device

# Installez l'APK
adb install app-release.apk

# Ou si vous avez AAB (moins courant via adb):
# Google Play Console la convertit automatiquement
```

### Via Google Play Console (Internal Testing) - Recommandé

**Meilleure option si vous avez un compte Play Console :**

1. Google Play Console → Votre app
2. **Testing** → **Internal Testing**
3. Chargez l'AAB
4. Ajoutez votre email Google
5. Allez sur Play Store → Votre app
6. Cliquez "Tester"
7. L'app s'installe via Play Store

---

## Étape 3 : Tests sur appareil

Suivez [docs/TEST_CHECKLIST.md](TEST_CHECKLIST.md)

**Clé :** Les tests Release incluent :
- ✅ Pas de données mock par défaut
- ✅ Authentification réelle Supabase requise
- ✅ Performance optimisée

---

## Étape 4 : Logs & Debugging

### Voir les logs en temps réel

```bash
adb logcat
```

### Filtrer les erreurs SoukCI

```bash
adb logcat | grep -E "SoukCI|ReactNative|CRASH"
```

### Exporter les logs

```bash
adb logcat > app.log
cat app.log | grep ERROR
```

### Redémarrer l'app

```bash
adb shell am force-stop com.soukci.app
adb shell am start -n com.soukci.app/.MainActivity
```

---

## Troubleshooting

### ❌ "device not found"

```bash
adb devices
# Si liste vide ou offline :

# Redémarrage adb
adb kill-server
adb start-server
adb devices

# Ou reconnecter USB et refaire USB Debugging ON
```

### ❌ "APP CRASHED ON STARTUP"

```bash
# Vérifiez les logs
adb logcat | grep "CRASH"

# Causes communes:
# 1. Variables d'env manquantes (Supabase URL, keys)
# 2. Permission non accordée (localisation)
# 3. Supabase down

# Correction: Vérifier .env ou EAS secrets
```

### ❌ "Installation failed: INSTALL_FAILED_..."

```bash
# APK incompatible (trop ancien SDK)
# Ou app déjà installée

# Solution :
adb uninstall com.soukci.app
adb install app-release.apk
```

### ❌ "Play Store dit "app not compatible with your device"

→ Vérifiez `app.json`:
```json
{
  "expo": {
    "android": {
      "minSdkVersion": 24,           // ← Ne pas trop bas
      "targetSdkVersion": 34         // ← Doit être ≥ 34 pour Play Store 2024
    }
  }
}
```

---

## Après le test

✅ **Si tout marche :**
- Notez le numéro de build/version
- Passez à étape 4 : Google Play Console

❌ **Si erreurs :**
- Notez les logs d'erreur
- Fixez le code
- Regénérez le build

---

## Commandes utiles

```bash
# Info sur l'app installée
adb shell dumpsys package com.soukci.app

# Vérifier la version
adb shell dumpsys package com.soukci.app | grep version

# Désinstaller
adb uninstall com.soukci.app

# Installer + lancer directement
adb install -r app-release.apk && adb shell am start -n com.soukci.app/.MainActivity
```

---

Besoin d'aide ? Vérifiez [docs/RELEASE_READINESS.md](RELEASE_READINESS.md) ou contactez EAS support.
