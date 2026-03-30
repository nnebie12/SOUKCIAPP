import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export function WebFooter() {
  if (Platform.OS !== 'web') return null;

  return (
    <View style={styles.footer}>
      <View style={styles.inner}>
        <Text style={styles.brand}>SoukCI &copy; {new Date().getFullYear()}</Text>

        <View style={styles.links}>
          <Pressable onPress={() => router.push('/legal/privacy')}>
            {({ hovered }) => (
              <Text style={[styles.link, hovered && styles.linkHovered]}>
                Confidentialite
              </Text>
            )}
          </Pressable>

          <Text style={styles.separator}>•</Text>

          <Pressable onPress={() => router.push('/legal/data-rights')}>
            {({ hovered }) => (
              <Text style={[styles.link, hovered && styles.linkHovered]}>
                Droits utilisateur
              </Text>
            )}
          </Pressable>

          <Text style={styles.separator}>•</Text>

          <Pressable onPress={() => router.push('/legal/delete-account')}>
            {({ hovered }) => (
              <Text style={[styles.link, styles.linkDanger, hovered && styles.linkDangerHovered]}>
                Suppression de compte
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    backgroundColor: Colors.background.secondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  inner: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  brand: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  separator: {
    color: Colors.text.light,
    fontSize: FontSizes.sm,
  },
  link: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  linkHovered: {
    textDecorationLine: 'underline',
  },
  linkDanger: {
    color: Colors.status.error,
  },
  linkDangerHovered: {
    textDecorationLine: 'underline',
  },
});
