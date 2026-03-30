import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import React from 'react';
import { Alert, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SUPPORT_EMAIL = 'privacy@soukci.app';

async function requestAccountDeletion() {
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Suppression de mon compte SoukCI')}`;
  try {
    await Linking.openURL(mailto);
  } catch (error) {
    Alert.alert('Erreur', "Impossible d'ouvrir votre application email pour le moment.");
  }
}

export default function DeleteAccountScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Suppression de compte</Text>
        <Text style={styles.subtitle}>
          Cette action est sensible. Nous vous recommandons de lire les consequences avant de continuer.
        </Text>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>Ce qui sera supprime</Text>
          <Text style={styles.warningItem}>• Votre profil utilisateur</Text>
          <Text style={styles.warningItem}>• Vos favoris et preferences</Text>
          <Text style={styles.warningItem}>• Votre historique d'activites lie au compte</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Delai de traitement</Text>
          <Text style={styles.infoText}>
            Les demandes sont traitees sous 7 jours ouvres apres verification de l'identite du titulaire du compte.
          </Text>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={requestAccountDeletion}>
          <Text style={styles.deleteButtonText}>Demander la suppression de mon compte</Text>
        </TouchableOpacity>

        <Text style={styles.contactText}>Besoin d'aide: {SUPPORT_EMAIL}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#FFD6D6',
    gap: 6,
  },
  warningTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.status.error,
    marginBottom: Spacing.xs,
  },
  warningItem: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  infoTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: Colors.status.error,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  contactText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
