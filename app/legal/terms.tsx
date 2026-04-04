import { PUBLIC_TERMS_URL, SUPPORT_EMAIL } from '@/constants/legal';
import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import React from 'react';
import { Alert, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

async function openUrl(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Erreur', 'Impossible d ouvrir ce lien pour le moment.');
  }
}

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Conditions d utilisation</Text>
        <Text style={styles.updatedAt}>Derniere mise a jour: 4 avril 2026</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Objet du service</Text>
          <Text style={styles.paragraph}>
            SoukCI permet aux utilisateurs de decouvrir des boutiques, consulter des informations commerciales,
            enregistrer des favoris, publier des avis et, selon les fonctionnalites actives, initier des commandes
            ou des demandes de mise en avant commerciale.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>2. Compte utilisateur</Text>
          <Text style={styles.paragraph}>
            Vous etes responsable de l exactitude des informations transmises lors de l inscription et de la
            confidentialite de vos identifiants. Toute utilisation frauduleuse ou contraire a la loi peut entrainer
            la suspension du compte.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>3. Contenus et comportements</Text>
          <Text style={styles.paragraph}>
            Vous vous engagez a ne pas publier de contenu trompeur, diffamatoire, illicite ou portant atteinte aux
            droits de tiers. Les avis, descriptions de boutiques et informations commerciales doivent rester exacts
            et verifiables.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>4. Commandes et paiements</Text>
          <Text style={styles.paragraph}>
            Les interactions de commande ou de paiement affichees dans l application peuvent dependre de services
            tiers ou de l activation effective de certaines fonctionnalites. Les boutiques restent responsables des
            prix, disponibilites, delais et conditions commerciales presentes aux utilisateurs.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>5. Disponibilite du service</Text>
          <Text style={styles.paragraph}>
            Nous nous efforcons d assurer la disponibilite de SoukCI, sans garantir une absence totale
            d interruption, d erreur ou de maintenance. Certaines fonctionnalites peuvent evoluer, etre limitees
            ou retirees pour des raisons techniques, legales ou de securite.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>6. Contact</Text>
          <Text style={styles.paragraph}>
            Pour toute question relative aux conditions d utilisation ou a votre compte, contactez {SUPPORT_EMAIL}.
          </Text>
        </View>

        <TouchableOpacity style={styles.publicLinkButton} onPress={() => openUrl(PUBLIC_TERMS_URL)}>
          <Text style={styles.publicLinkButtonText}>Ouvrir la version publique de ces conditions</Text>
        </TouchableOpacity>
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
  publicLinkButton: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  publicLinkButtonText: {
    color: Colors.text.primary,
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
});