import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable } from 'react-native';
import { Shop } from '@/types/database';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import { MapPin, Star, Heart, Phone } from 'lucide-react-native';
import { router } from 'expo-router';

interface ShopCardProps {
  shop: Shop;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
}

export function ShopCard({ shop, onFavoritePress, isFavorite = false }: ShopCardProps) {
  const handlePress = () => {
    router.push({ pathname: '/shop/[id]', params: { id: shop.id } });
  };

  const getPaymentMethods = () => {
    const methods = [];
    if (shop.accepts_wave) methods.push('Wave');
    if (shop.accepts_orange_money) methods.push('Orange Money');
    if (shop.accepts_mtn_money) methods.push('MTN');
    return methods.join(', ');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {shop.photo_url ? (
          <Image source={{ uri: shop.photo_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>{shop.name.charAt(0)}</Text>
          </View>
        )}
        {shop.is_premium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
        {shop.is_verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓</Text>
          </View>
        )}
        <Pressable style={styles.favoriteButton} onPress={onFavoritePress}>
          <Heart
            size={20}
            color={isFavorite ? Colors.status.error : Colors.white}
            fill={isFavorite ? Colors.status.error : 'transparent'}
          />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {shop.name}
        </Text>

        {shop.category && (
          <Text style={styles.category} numberOfLines={1}>
            {shop.category.name_fr}
          </Text>
        )}

        <View style={styles.locationRow}>
          <MapPin size={14} color={Colors.text.secondary} />
          <Text style={styles.location} numberOfLines={1}>
            {shop.neighborhood ? `${shop.neighborhood}, ` : ''}
            {shop.city?.name}
          </Text>
        </View>

        {shop.rating_count > 0 && (
          <View style={styles.ratingRow}>
            <Star size={14} color={Colors.primary} fill={Colors.primary} />
            <Text style={styles.rating}>
              {shop.rating_avg.toFixed(1)} ({shop.rating_count})
            </Text>
          </View>
        )}

        {shop.has_delivery && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>Livraison disponible</Text>
          </View>
        )}

        {getPaymentMethods() && (
          <Text style={styles.paymentMethods} numberOfLines={1}>
            {getPaymentMethods()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.white,
  },
  premiumBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  premiumText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: 50,
    backgroundColor: Colors.secondary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.md,
  },
  name: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  category: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  location: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginLeft: 4,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  rating: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  tag: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  tagText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  paymentMethods: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
});
