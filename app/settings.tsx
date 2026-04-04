import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '@/constants/theme';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { router } from 'expo-router';
import { ChevronRight, Clock3, FileText, Shield, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const { clearHistory, history } = useSearchHistory();

  const handleClearHistory = () => {
    if (history.length === 0) {
      Alert.alert('Historique vide', 'Aucune recherche enregistree pour le moment.');
      return;
    }

    Alert.alert(
      'Effacer l historique',
      'Voulez-vous supprimer tout votre historique de recherche ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: () => {
            clearHistory();
            Alert.alert('Historique efface', 'Votre historique de recherche a ete supprime.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Parametres</Text>
          <Text style={styles.subtitle}>Confidentialite, historique et preferences de compte</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recherche</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleClearHistory}>
            <View style={styles.menuIcon}><Clock3 size={20} color={Colors.primary} /></View>
            <View style={styles.menuContent}>
              <Text style={styles.menuItemText}>Effacer l historique de recherche</Text>
              <Text style={styles.menuItemSubtext}>{history.length} recherche{history.length > 1 ? 's' : ''} enregistree{history.length > 1 ? 's' : ''}</Text>
            </View>
            <ChevronRight size={18} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Protection des donnees</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/legal/privacy')}>
            <View style={styles.menuIcon}><Shield size={20} color={Colors.status.info} /></View>
            <View style={styles.menuContent}>
              <Text style={styles.menuItemText}>Politique de confidentialite</Text>
              <Text style={styles.menuItemSubtext}>Consulter les informations sur vos donnees</Text>
            </View>
            <ChevronRight size={18} color={Colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/legal/data-rights')}>
            <View style={styles.menuIcon}><FileText size={20} color={Colors.secondary} /></View>
            <View style={styles.menuContent}>
              <Text style={styles.menuItemText}>Mes droits sur mes donnees</Text>
              <Text style={styles.menuItemSubtext}>Acces, rectification et suppression</Text>
            </View>
            <ChevronRight size={18} color={Colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/legal/delete-account')}>
            <View style={styles.menuIcon}><Trash2 size={20} color={Colors.status.error} /></View>
            <View style={styles.menuContent}>
              <Text style={styles.menuItemText}>Suppression de compte</Text>
              <Text style={styles.menuItemSubtext}>Supprimer votre compte et les donnees associees</Text>
            </View>
            <ChevronRight size={18} color={Colors.text.secondary} />
          </TouchableOpacity>
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
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  header: {
    gap: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
  },
  menuContent: {
    flex: 1,
    gap: 2,
  },
  menuItemText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  menuItemSubtext: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
  },
});