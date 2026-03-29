import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Category } from '@/types/database';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import * as Icons from 'lucide-react-native';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
}

export function CategoryCard({ category, onPress }: CategoryCardProps) {
  const IconComponent = (Icons as any)[category.icon] || Icons.ShoppingBag;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
        <IconComponent size={32} color={category.color} strokeWidth={2} />
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {category.name_fr}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  name: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
});
