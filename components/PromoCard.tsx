import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { Promotion } from '@/types/database';
import { Tag, Clock } from 'lucide-react-native';
import { router } from 'expo-router';

interface PromoCardProps {
  promo: Promotion & { shop?: { id: string; name: string } };
}

function daysLeft(endsAt: string | null): string | null {
  if (!endsAt) return null;
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Expiré';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 1) return 'Dernier jour !';
  return `Encore ${days} jours`;
}

export function PromoCard({ promo }: PromoCardProps) {
  const remaining = daysLeft(promo.ends_at);
  const isUrgent = remaining === 'Dernier jour !';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => promo.shop && router.push(`/shop/${promo.shop.id}`)}
      activeOpacity={0.85}>
      <View style={[styles.badge, { backgroundColor: Colors.primary }]}>
        <Tag size={14} color={Colors.white} />
        {promo.discount_percent && (
          <Text style={styles.badgeText}>-{promo.discount_percent}%</Text>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{promo.title}</Text>
        {promo.shop && (
          <Text style={styles.shopName} numberOfLines={1}>{promo.shop.name}</Text>
        )}
        {promo.description && (
          <Text style={styles.desc} numberOfLines={2}>{promo.description}</Text>
        )}
      </View>

      {remaining && (
        <View style={[styles.timeRow, isUrgent && styles.timeRowUrgent]}>
          <Clock size={12} color={isUrgent ? Colors.status.error : Colors.text.secondary} />
          <Text style={[styles.timeText, isUrgent && styles.timeTextUrgent]}>{remaining}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginRight: Spacing.md,
    ...Shadows.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.xs,
    minHeight: 60,
  },
  badgeText: {
    color: Colors.white,
    fontSize: FontSizes.xl,
    fontWeight: '800',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  shopName: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  desc: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  timeRowUrgent: {},
  timeText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  timeTextUrgent: {
    color: Colors.status.error,
  },
});
