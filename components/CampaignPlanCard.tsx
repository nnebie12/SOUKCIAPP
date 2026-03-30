import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Check, Star, Zap, Rocket } from 'lucide-react-native';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { CampaignPlan } from '@/types/database';

interface CampaignPlanCardProps {
  plan: CampaignPlan;
  selected?: boolean;
  onSelect?: (plan: CampaignPlan) => void;
}

const PLAN_CONFIG: Record<
  string,
  { icon: typeof Star; color: string; bgColor: string }
> = {
  basic:   { icon: Star,   color: Colors.secondary,       bgColor: Colors.secondary + '18' },
  premium: { icon: Zap,    color: Colors.primary,         bgColor: Colors.primary + '18' },
  boost:   { icon: Rocket, color: Colors.status.info,     bgColor: Colors.status.info + '18' },
};

export function CampaignPlanCard({
  plan,
  selected = false,
  onSelect,
}: CampaignPlanCardProps) {
  const config = PLAN_CONFIG[plan.name] ?? PLAN_CONFIG.basic;
  const PlanIcon = config.icon;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        plan.highlight && styles.cardHighlight,
        selected && styles.cardSelected,
        selected && { borderColor: config.color },
      ]}
      onPress={() => onSelect?.(plan)}
      activeOpacity={0.85}>

      {/* Badge "Recommandé" */}
      {plan.highlight && (
        <View style={[styles.badge, { backgroundColor: config.color }]}>
          <Text style={styles.badgeText}>Recommandé</Text>
        </View>
      )}

      {/* Icône + Nom */}
      <View style={[styles.iconBox, { backgroundColor: config.bgColor }]}>
        <PlanIcon size={28} color={config.color} />
      </View>

      <Text style={[styles.planName, { color: config.color }]}>
        {plan.label_fr}
      </Text>

      {/* Prix */}
      <View style={styles.priceRow}>
        <Text style={styles.price}>
          {plan.price_fcfa.toLocaleString('fr-CI')}
        </Text>
        <Text style={styles.priceCurrency}> FCFA</Text>
      </View>
      <Text style={styles.duration}>{plan.duration_days} jours</Text>

      {/* Features */}
      <View style={styles.featuresList}>
        {plan.features.map((feat, idx) => (
          <View key={idx} style={styles.featureRow}>
            <Check size={14} color={config.color} />
            <Text style={styles.featureText}>{feat}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[
          styles.cta,
          { backgroundColor: selected ? config.color : 'transparent' },
          { borderColor: config.color },
        ]}
        onPress={() => onSelect?.(plan)}>
        <Text
          style={[
            styles.ctaText,
            { color: selected ? Colors.white : config.color },
          ]}>
          {selected ? 'Sélectionné ✓' : 'Choisir ce forfait'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border.light,
    ...Shadows.md,
  },
  cardHighlight: {
    borderColor: Colors.primary + '40',
    backgroundColor: Colors.primary + '04',
  },
  cardSelected: {
    borderWidth: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.sm,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  planName: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  priceCurrency: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  duration: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  featuresList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  featureText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  cta: {
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  ctaText: {
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
});
