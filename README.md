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

Les variables Supabase sont déjà configurées dans `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=votre_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_clé
```

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
5. Publier des promotions
6. Consulter les statistiques
7. Opter pour l'abonnement Premium

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
- Abonnement Premium pour commerçants (mise en avant, analytics avancées)
- Publicité ciblée par ville/catégorie
- Commissions optionnelles sur les ventes en ligne

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

## Licence

Tous droits réservés © 2024 SoukCI
