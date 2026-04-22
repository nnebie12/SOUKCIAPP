import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import { useBilling } from '@/contexts/BillingContext';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle2, Crown, RefreshCcw } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PremiumSubscriptionScreen() {
  const { user } = useAuth();
  const { ready, enabled, hasPremiumEntitlement, premiumPackages, purchasePremiumPackage, restorePurchases } = useBilling();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const handlePurchase = async (pkg: (typeof premiumPackages)[number]) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    try {
      setLoadingId(pkg.identifier);
      await purchasePremiumPackage(pkg);
      Alert.alert('Abonnement activé', 'Votre accès Premium a été activé avec succès.');
      router.back();
    } catch (error: any) {
      Alert.alert('Achat impossible', error?.message ?? 'L abonnement Premium n a pas pu être activé.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      await restorePurchases();
      Alert.alert('Restauration terminée', 'Les achats disponibles ont été restaurés.');
    } catch (error: any) {
      Alert.alert('Restauration impossible', error?.message ?? 'Aucun achat n a pu être restauré.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color={Colors.text.primary} />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>

        <View style={styles.hero}>
          <Crown size={34} color={Colors.primary} />
          <Text style={styles.title}>SoukCI Premium</Text>
          <Text style={styles.subtitle}>
            Débloquez la mise en avant de votre boutique et l accès aux campagnes sponsorisées avec un abonnement géré par Google Play Billing.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Inclus dans Premium</Text>
          <Text style={styles.featureItem}>• Mise en avant de votre boutique</Text>
          <Text style={styles.featureItem}>• Création et activation des campagnes</Text>
          <Text style={styles.featureItem}>• Gestion d abonnement conforme Google Play</Text>
        </View>

        {hasPremiumEntitlement ? (
          <View style={styles.activeCard}>
            <CheckCircle2 size={20} color={Colors.status.success} />
            <View style={styles.activeTextBox}>
              <Text style={styles.activeTitle}>Premium actif</Text>
              <Text style={styles.activeText}>Votre boutique peut maintenant être synchronisée comme Premium et accéder aux campagnes.</Text>
            </View>
          </View>
        ) : null}

        {!ready ? (
          <View style={styles.centeredBox}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : !enabled ? (
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>Configuration requise</Text>
            <Text style={styles.featureItem}>Ajoutez EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY et configurez les produits/offres dans RevenueCat avant de tester l achat réel.</Text>
          </View>
        ) : premiumPackages.length === 0 ? (
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>Aucune offre disponible</Text>
            <Text style={styles.featureItem}>Aucune offre RevenueCat n est servie pour l identifiant merchant_premium.</Text>
          </View>
        ) : (
          premiumPackages.map((pkg) => (
            <View key={pkg.identifier} style={styles.packageCard}>
              <Text style={styles.packageTitle}>{pkg.title}</Text>
              <Text style={styles.packageDescription}>{pkg.description}</Text>
              <Text style={styles.packagePrice}>{pkg.priceString}</Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => handlePurchase(pkg)}
                disabled={loadingId === pkg.identifier}>
                {loadingId === pkg.identifier ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Activer Premium</Text>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={handleRestore} disabled={restoring || !enabled}>
          {restoring ? <ActivityIndicator color={Colors.primary} /> : <RefreshCcw size={18} color={Colors.primary} />}
          <Text style={styles.secondaryButtonText}>Restaurer mes achats</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  backText: { color: Colors.text.primary, fontWeight: '600' },
  hero: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, gap: Spacing.sm, alignItems: 'flex-start' },
  title: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.text.primary },
  subtitle: { fontSize: FontSizes.md, color: Colors.text.secondary, lineHeight: 22 },
  featureCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, gap: Spacing.xs },
  featureTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.text.primary },
  featureItem: { fontSize: FontSizes.sm, color: Colors.text.secondary, lineHeight: 20 },
  activeCard: { backgroundColor: Colors.status.success + '14', borderRadius: BorderRadius.xl, padding: Spacing.md, flexDirection: 'row', gap: Spacing.sm },
  activeTextBox: { flex: 1, gap: 4 },
  activeTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.status.success },
  activeText: { fontSize: FontSizes.sm, color: Colors.text.secondary, lineHeight: 20 },
  centeredBox: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: 'center' },
  packageCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, gap: Spacing.sm },
  packageTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text.primary },
  packageDescription: { fontSize: FontSizes.sm, color: Colors.text.secondary, lineHeight: 20 },
  packagePrice: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.primary },
  primaryButton: { minHeight: 48, borderRadius: BorderRadius.lg, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: Colors.white, fontWeight: '700', fontSize: FontSizes.md },
  secondaryButton: { minHeight: 48, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.primary, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: Spacing.xs },
  secondaryButtonText: { color: Colors.primary, fontWeight: '700', fontSize: FontSizes.sm },
});
