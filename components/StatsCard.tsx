import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react-native';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

// ═══════════════════════════════════════════════════════════════════
// StatsCard
// ═══════════════════════════════════════════════════════════════════

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: number;       // % de variation, ex: +12 ou -5
  suffix?: string;      // ex: ' FCFA', ' avis'
  compact?: boolean;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  iconColor = Colors.primary,
  trend,
  suffix = '',
  compact = false,
}: StatsCardProps) {
  const trendPositive = trend !== undefined && trend >= 0;
  const TrendIcon = trendPositive ? TrendingUp : TrendingDown;
  const trendColor = trendPositive ? Colors.status.success : Colors.status.error;

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={[styles.iconBox, { backgroundColor: iconColor + '18' }]}>
        <Icon size={compact ? 18 : 22} color={iconColor} />
      </View>

      <Text style={[styles.value, compact && styles.valueCompact]}>
        {typeof value === 'number' ? value.toLocaleString('fr-CI') : value}
        {suffix}
      </Text>

      <Text style={[styles.label, compact && styles.labelCompact]} numberOfLines={1}>
        {label}
      </Text>

      {trend !== undefined && (
        <View style={styles.trendRow}>
          <TrendIcon size={12} color={trendColor} />
          <Text style={[styles.trendText, { color: trendColor }]}>
            {Math.abs(trend)}%
          </Text>
        </View>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MiniChart — sparkline bar chart
// ═══════════════════════════════════════════════════════════════════

interface MiniChartProps {
  data: number[];
  color?: string;
  height?: number;
  label?: string;
}

export function MiniChart({
  data,
  color = Colors.primary,
  height = 48,
  label,
}: MiniChartProps) {
  const max = Math.max(...data, 1);
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <View style={styles.chartContainer}>
      {label ? <Text style={styles.chartLabel}>{label}</Text> : null}
      <View style={[styles.barsRow, { height }]}>
        {data.map((val, idx) => {
          const pct = (val / max) * 100;
          return (
            <View key={idx} style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${Math.max(pct, 4)}%`,
                    backgroundColor: idx === data.length - 1 ? color : color + '60',
                    borderRadius: BorderRadius.sm,
                  },
                ]}
              />
              <Text style={styles.barDayLabel}>
                {days[idx % days.length]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // StatsCard
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    flex: 1,
    ...Shadows.sm,
  },
  cardCompact: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  value: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  valueCompact: {
    fontSize: FontSizes.lg,
  },
  label: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  labelCompact: {
    fontSize: 10,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: Spacing.xs,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // MiniChart
  chartContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  chartLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '80%',
    minHeight: 4,
  },
  barDayLabel: {
    fontSize: 9,
    color: Colors.text.light,
    marginTop: 2,
  },
});
