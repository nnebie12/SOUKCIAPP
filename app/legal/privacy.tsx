import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Politique de confidentialite</Text>
        <Text style={styles.updatedAt}>Derniere mise a jour: 30 mars 2026</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Donnees collectees</Text>
          <Text style={styles.paragraph}>
            Nous collectons uniquement les donnees necessaires au fonctionnement de l'application: profil
            utilisateur (nom, email, telephone facultatif), favoris, avis, commandes et interactions avec les
            boutiques.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>2. Utilisation de vos donnees</Text>
          <Text style={styles.paragraph}>
            Vos donnees sont utilisees pour personnaliser votre experience, afficher vos favoris, traiter vos
            commandes, ameliorer la qualite du service et prevenir les abus.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>3. Partage et confidentialite</Text>
          <Text style={styles.paragraph}>
            Nous ne vendons pas vos donnees personnelles. Les informations ne sont partagees qu'avec les
            services techniques necessaires (hebergement, authentification, base de donnees) pour faire
            fonctionner SoukCI.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>4. Conservation des donnees</Text>
          <Text style={styles.paragraph}>
            Les donnees sont conservees pendant la duree de vie de votre compte ou selon les obligations
            legales applicables. Vous pouvez demander la suppression de vos donnees a tout moment.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>5. Securite</Text>
          <Text style={styles.paragraph}>
            Nous appliquons des mesures techniques et organisationnelles pour proteger vos donnees contre
            les acces non autorises, les pertes et les modifications accidentelles.
          </Text>
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
  updatedAt: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  paragraph: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});
