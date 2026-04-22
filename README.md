# SoukCI - Plateforme de Découverte de Boutiques en Côte d'Ivoire

SoukCI est une application mobile et web complète qui réunit toutes les boutiques de Côte d'Ivoire pour permettre aux utilisateurs de découvrir, comparer et choisir où faire leurs achats.

## Caractéristiques Principales

### Pour les Acheteurs
- **Recherche avancée** : Trouvez des boutiques par catégorie, ville, quartier ou produit
- **Géolocalisation** : Découvrez les boutiques les plus proches de vous
- **Fiches détaillées** : Photos, horaires, avis, produits phares, contacts
- **Système d'évaluation** : Notez et commentez les boutiques
- **Filtres intelligents** : Ouvert maintenant, livraison disponible, promotions
- **Favoris** : Sauvegardez vos boutiques préférées
- **Partage** : Partagez les boutiques via WhatsApp

### Pour les Commerçants
- **Inscription gratuite** : Créez rapidement votre vitrine
- **Tableau de bord** : Gérez facilement vos produits et promotions
- **Statistiques** : Suivez les visites et les clics
- **Promotions** : Publiez vos offres spéciales
- **Abonnement Premium** : Mise en avant et statistiques avancées

## Stack Technique

### Frontend
- **React Native** avec Expo pour le support web et mobile
- **Expo Router** pour la navigation
- **TypeScript** pour la sécurité des types
- **Lucide React Native** pour les icônes

### Backend & Database
- **Supabase** pour l'authentification et la base de données
- **PostgreSQL** pour le stockage des données
- **Row Level Security (RLS)** pour la sécurité

### Features
- Paiements mobiles : Wave, Orange Money, MTN Money
- Authentification par email/password
- Gestion des favoris et historique
- Système d'avis et de notation

## Structure du Projet

```
├── app/
│   ├── (tabs)/                 # Navigation par onglets
│   │   ├── index.tsx          # Accueil
│   │   ├── explore.tsx        # Exploration avec filtres
│   │   ├── favorites.tsx      # Boutiques favorites
│   │   └── profile.tsx        # Profil utilisateur
│   ├── auth/                   # Authentification
│   │   ├── login.tsx          # Connexion
│   │   └── register.tsx       # Inscription
│   └── shop/                   # Gestion des boutiques
│       ├── [id].tsx           # Détail boutique
│       ├── merchant.tsx       # Tableau de bord commerçant
│       └── create-shop.tsx    # Création boutique
├── components/                 # Composants réutilisables
│   ├── ShopCard.tsx           # Carte boutique
│   ├── CategoryCard.tsx       # Carte catégorie
│   └── SearchBar.tsx          # Barre de recherche
├── contexts/                   # Context API
│   └── AuthContext.tsx        # Gestion de l'authentification
├── lib/                        # Utilitaires
│   └── supabase.ts            # Client Supabase
├── types/                      # Types TypeScript
│   └── database.ts            # Types Supabase
└── constants/                  # Constantes
    └── theme.ts               # Thème et couleurs
```

## Schéma Base de Données

### Tables principales
- **users** (gérée par Supabase Auth)
- **user_profiles** : Profils utilisateur étendus
- **cities** : 23 villes principales de Côte d'Ivoire
- **categories** : 12 catégories adaptées au marché local
- **shops** : Boutiques/magasins
- **products** : Produits proposés par les boutiques
- **reviews** : Avis et notations clients
- **favorites** : Boutiques favorites des utilisateurs
- **promotions** : Promotions des commerçants
- **shop_hours** : Horaires d'ouverture

## Catégories de Boutiques

1. Pagnes & Mode
2. Vivriers & Alimentation
3. Maquis & Restaurants
4. Pharmacies & Santé
5. Quincaillerie & BTP
6. Téléphonie & Électronique
7. Cosmétiques Africains
8. Agriculture & Semences
9. Meubles & Décoration
10. Auto & Moto
11. Librairie & Fournitures
12. Services & Artisanat

## Villes Couvertes (23)

Abidjan, Bouaké, Daloa, Yamoussoukro, San-Pédro, Korhogo, Man, Gagnoa, Divo, Abengourou, Grand-Bassam, Bondoukou, Ferkessédougou, Dimbokro, Odienné, Séguéla, Soubré, Adzopé, Agboville, Dabou, Toumodi, Issia, Bingerville

## Guide de Démarrage

### Installation

```bash
npm install
```

### Variables d'Environnement

Copiez `.env.example` vers `.env` en local. Ne partagez jamais `.env` dans un ZIP ou un export manuel du projet.

Variables locales requises:
```
EXPO_PUBLIC_SUPABASE_URL=votre_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_clé
EXPO_PUBLIC_SENTRY_DSN=votre_dsn_sentry
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=votre_cle_android_revenuecat
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=votre_cle_ios_revenuecat
```

Variable optionnelle de developpement:
```
EXPO_PUBLIC_ENABLE_MOCK_FALLBACK=1
```

Par defaut, les builds de production n'affichent plus les donnees mock. Activez cette variable uniquement pour des demonstrations ou tests hors production.

### Secrets EAS

Pour les builds de production, n'incluez pas `.env` dans l'archive du projet. Injectez les secrets directement dans EAS :

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "votre_url"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "votre_clé"
eas secret:create --scope project --name EXPO_PUBLIC_SENTRY_DSN --value "votre_dsn_sentry"
eas secret:create --scope project --name EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY --value "votre_cle_android_revenuecat"
eas secret:create --scope project --name EXPO_PUBLIC_REVENUECAT_IOS_API_KEY --value "votre_cle_ios_revenuecat"
```

Secrets Supabase Edge Functions requis:
```
CINETPAY_API_KEY=votre_cle_api_cinetpay
CINETPAY_SITE_ID=votre_site_id_cinetpay
CINETPAY_RETURN_URL=https://soukci.app/payments/return
REVENUECAT_SECRET_KEY=votre_secret_api_revenuecat
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

Le projet fournit aussi une archive sûre sans fichiers locaux sensibles :

```bash
npm run archive:safe
```

Cette commande génère `SoukCI-source.zip` à partir des fichiers suivis par Git, donc sans `.env`.

### Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:8081` (web) et via l'Expo Go app (mobile).

### Vérification des Types

```bash
npm run typecheck
```

## Flux Utilisateur

### Acheteur
1. Inscription/Connexion
2. Parcourir les boutiques (Accueil)
3. Rechercher et filtrer (Explore)
4. Consulter les détails d'une boutique
5. Laisser un avis
6. Ajouter aux favoris

### Commerçant
1. Inscription
2. Créer sa boutique
3. Accéder au tableau de bord
4. Ajouter des produits
5. Soumettre des demandes de campagnes
6. Consulter les statistiques
7. Demander une mise en avant Premium

## Sécurité

- **Row Level Security (RLS)** : Chaque utilisateur ne peut modifier que ses données
- **Authentification JWT** : Tokens sécurisés via Supabase Auth
- **HTTPS obligatoire** : Tout le trafic est chiffré
- **Validation des entrées** : Côté client et serveur
- **Pas de stockage de mots de passe** : Gérés par Supabase Auth

## Modèle Économique

### Phase 1 (MVP - Actuelle)
- Inscription gratuite pour tous
- Tableau de bord basique gratuit
- Recherche et consultations gratuites

### Phase 2 (Planifiée)
- Abonnement Premium pour commerçants via Google Play Billing et RevenueCat
- Campagnes sponsorisées réservées aux boutiques Premium
- Commissions optionnelles sur les ventes en ligne

Note importante:

- Les commandes Wave, Orange Money et MTN Money ouvrent désormais un checkout CinetPay in-app. Le mode espèces reste un règlement hors ligne avec le commerçant.
- L abonnement Premium et l accès aux campagnes sont désormais prévus pour être verrouillés via Google Play Billing et RevenueCat côté client, puis resynchronisés côté Supabase.
- Le plugin de build Sentry n'est pas active dans la configuration Expo tant que l'organisation et le projet Sentry de release ne sont pas configures pour l'upload des sourcemaps.

## Performance

- **Lazy loading** des images
- **Pagination** des résultats
- **Caching** avec Supabase
- **Optimisation** pour les connexions lentes
- **Code splitting** automatique avec Expo Router

## Localisation

- Interface entièrement en français
- Formatage des prix en FCFA
- Adaptation des catégories au marché local
- Support des paiements mobiles africains

## Contribution

Pour contribuer :
1. Créez une branche feature
2. Faites vos modifications
3. Soumettez une pull request

## Support

Pour toute question ou problème, contactez l'équipe SoukCI.

### URLs legales publiques

- Politique de confidentialite: https://soukci.app/legal/privacy
- Droits utilisateur: https://soukci.app/legal/data-rights
- Suppression de compte: https://soukci.app/legal/delete-account

Ces URLs doivent etre publiees sur le site web de production avant soumission Play Store.

### Preparation Play Store

- Checklist de soumission: docs/PLAY_STORE_CHECKLIST.md
- Cartographie Data safety: docs/DATA_SAFETY.md
- Etat de preparation release: docs/RELEASE_READINESS.md

### Suppression de compte backend

- Fonction Supabase Edge attendue: supabase/functions/delete-account
- Secret requis cote Supabase: SUPABASE_SERVICE_ROLE_KEY
- La suppression reelle du compte passe par la fonction serveur, puis les donnees applicatives sont nettoyees par cascades SQL quand elles referencent auth.users.

## Licence

Tous droits réservés © 2024 SoukCI


# SoukCI — Guide d'intégration des nouveaux fichiers

## Structure des fichiers livrés

```
soukci-evolution/
├── supabase/migrations/
│   └── 20260330000001_cart_orders_campaigns.sql   ← Livrable 1
├── types/
│   └── database.ts                                ← Livrable 2
├── data/
│   └── mockData.ts                                ← Données fictives dev
├── contexts/
│   └── CartContext.tsx                            ← Livrable 3
├── hooks/
│   ├── useReviews.ts                              ← Livrable 4a
│   ├── useCart.ts                                 ← Livrable 4b
│   └── useStats.ts                                ← Livrable 4c
├── components/
│   ├── ReviewCard.tsx        (ReviewCard + ReviewModal)
│   ├── CartDrawer.tsx        (CartDrawer + CartItemRow)
│   ├── StatsCard.tsx         (StatsCard + MiniChart)
│   ├── ShareButton.tsx       (ShareButton + FavoriteBtn)
│   └── CampaignPlanCard.tsx
└── app/
    ├── cart.tsx                                   ← Livrable 7
    ├── orders.tsx                                 ← Livrable 7
    ├── campaigns.tsx                              ← Livrable 8
    ├── auth/
    │   └── register.tsx                           ← Livrable 5
    └── shop/
        └── merchant.tsx                           ← Livrable 6
```

---

## Étapes d'intégration

### 1. Migration SQL
Lancez la migration dans votre dashboard Supabase :
```
supabase/migrations/20260330000001_cart_orders_campaigns.sql
```
Elle crée les tables `cart_items`, `orders`, `order_items`, `campaign_plans`, `campaigns` et étend `reviews`.

### 2. Remplacer les fichiers existants
Copiez chaque fichier à sa destination dans votre projet en respectant la structure ci-dessus.

### 3. Entourer l'app avec CartProvider
Dans `app/_layout.tsx`, ajoutez `CartProvider` :

```tsx
import { CartProvider } from '@/contexts/CartContext';

// Dans le return :
<AuthProvider>
  <CartProvider>
    <Stack>
      {/* ... */}
      <Stack.Screen name="cart"     options={{ headerShown: false }} />
      <Stack.Screen name="orders"   options={{ headerShown: false }} />
      <Stack.Screen name="campaigns" options={{ headerShown: false }} />
    </Stack>
  </CartProvider>
</AuthProvider>
```

### 4. Mettre à jour signUp dans AuthContext
La nouvelle page register passe un objet `options` à `signUp` :
```ts
await signUp(email, password, fullName, phone, {
  is_merchant: true,
  business_type: 'individual' | 'company' | null,
});
```

Adaptez la signature de `signUp` dans `AuthContext.tsx` :
```ts
const signUp = async (
  email: string,
  password: string,
  fullName: string,
  phone: string,
  options?: { is_merchant?: boolean; business_type?: string | null }
) => { ... }
```

Et transmettez `options.is_merchant` lors de l'upsert de `user_profiles`.

### 5. Ajouter `business_type` à la table user_profiles
```sql
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS business_type text
    CHECK (business_type IN ('individual', 'company'));
```

### 6. Accès aux nouvelles routes
- Panier : `router.push('/cart')`
- Commandes : `router.push('/orders')`
- Campagnes : `router.push('/campaigns')`

---

## Notes importantes

- **CartDrawer** peut être utilisé depuis n'importe quel écran via `<CartDrawer visible={show} onClose={() => setShow(false)} />`.
- **FavoriteBtn** et **ShareButton** s'utilisent directement dans la fiche boutique (`app/shop/[id].tsx`).
- **ReviewCard + ReviewModal** s'intègrent dans `app/shop/[id].tsx` via `useReviews(shopId)`.
- Les **données fictives** (`data/mockData.ts`) sont utilisées comme fallback quand Supabase n'est pas disponible.
