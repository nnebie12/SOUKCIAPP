import {
  PUBLIC_ACCOUNT_DELETION_URL,
  PUBLIC_PRIVACY_POLICY_URL,
  SUPPORT_EMAIL,
} from '@/constants/legal';
import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

async function openUrl(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Erreur', 'Impossible d ouvrir ce lien pour le moment.');
  }
}

export default function DeleteAccountScreen() {
  const { deleteAccount } = useAuth();

  const confirmDeletion = () => {
    Alert.alert(
      'Supprimer definitivement le compte',
      'Cette action est irreversible. Votre compte sera supprime ainsi que les donnees rattachees a celui-ci, sous reserve de nos obligations legales de conservation.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              Alert.alert('Compte supprime', 'Votre compte a ete supprime avec succes.');
              router.replace('/');
            } catch {
              Alert.alert(
                'Suppression impossible',
                'La suppression automatique a echoue. Contactez le support pour finaliser la demande.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Suppression de compte</Text>
        <Text style={styles.subtitle}>
          Cette action est sensible et irreversible. Vous pouvez supprimer directement votre compte depuis l application.
        </Text>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>Ce qui sera supprime</Text>
          <Text style={styles.warningItem}>• Votre profil utilisateur</Text>
          <Text style={styles.warningItem}>• Vos favoris, avis et preferences</Text>
          <Text style={styles.warningItem}>• Les donnees rattachees a votre compte, sauf obligations legales de conservation</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Comment ca fonctionne</Text>
          <Text style={styles.infoText}>
            Appuyez sur le bouton ci-dessous pour confirmer la suppression. Le compte Supabase est ensuite supprime et les donnees rattachees sont purgees automatiquement lorsqu elles dependent de votre identite utilisateur.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Conservation residuelle</Text>
          <Text style={styles.infoText}>
            Certaines traces techniques ou elements lies a des obligations comptables, antifraude ou de securite peuvent etre conserves temporairement pendant la duree strictement necessaire.
          </Text>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={confirmDeletion}>
          <Text style={styles.deleteButtonText}>Supprimer mon compte maintenant</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => openUrl(PUBLIC_ACCOUNT_DELETION_URL)}>
          <Text style={styles.secondaryButtonText}>Ouvrir la page publique de suppression</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => openUrl(PUBLIC_PRIVACY_POLICY_URL)}>
          <Text style={styles.secondaryButtonText}>Voir la politique de confidentialite publique</Text>
        </TouchableOpacity>

        <Text style={styles.contactText}>Besoin d aide : {SUPPORT_EMAIL}</Text>
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
  secondaryButton: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  deleteButtonText: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: Colors.text.primary,
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  contactText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
