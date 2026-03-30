import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import React from 'react';
import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SUPPORT_EMAIL = 'privacy@soukci.app';

async function openSupportMail(subject: string) {
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
  await Linking.openURL(mailto);
}

export default function DataRightsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Mes droits sur mes donnees</Text>
        <Text style={styles.subtitle}>
          Vous pouvez exercer vos droits a tout moment en envoyant une demande a l'equipe support.
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Droit d'acces</Text>
          <Text style={styles.paragraph}>Obtenir une copie des donnees personnelles associees a votre compte.</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => openSupportMail('Demande d acces aux donnees')}>
            <Text style={styles.actionButtonText}>Demander l'acces</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Droit de rectification</Text>
          <Text style={styles.paragraph}>Corriger des informations inexactes ou incompletes dans votre profil.</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => openSupportMail('Demande de rectification des donnees')}>
            <Text style={styles.actionButtonText}>Demander une correction</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Droit a l'effacement</Text>
          <Text style={styles.paragraph}>Demander la suppression de vos donnees personnelles et de votre compte.</Text>
          <TouchableOpacity style={styles.actionButtonDanger} onPress={() => openSupportMail('Demande d effacement des donnees')}>
            <Text style={styles.actionButtonText}>Demander l'effacement</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contact protection des donnees</Text>
          <Text style={styles.contactText}>{SUPPORT_EMAIL}</Text>
        </View>
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
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  paragraph: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  actionButtonDanger: {
    backgroundColor: Colors.status.error,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  contactCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  contactTitle: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: 6,
  },
  contactText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.primary,
  },
});
