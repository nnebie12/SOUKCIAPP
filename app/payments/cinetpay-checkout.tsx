import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function CinetPayCheckoutScreen() {
  const params = useLocalSearchParams<{ sessionId?: string; checkoutUrl?: string }>();
  const sessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  const checkoutUrl = Array.isArray(params.checkoutUrl) ? params.checkoutUrl[0] : params.checkoutUrl;
  const { clearCart } = useCart();
  const [status, setStatus] = useState<'pending' | 'paid' | 'failed' | 'cancelled'>('pending');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from('payment_sessions')
        .select('status')
        .eq('id', sessionId)
        .maybeSingle();

      if (cancelled || error || !data?.status) return;

      const nextStatus = data.status as typeof status;
      setStatus(nextStatus);
      setChecking(false);

      if (nextStatus === 'paid') {
        clearInterval(interval);
        await clearCart();
        Alert.alert('Paiement confirmé', 'Votre paiement a été confirmé. Vos commandes ont été créées.', [
          { text: 'Voir mes commandes', onPress: () => router.replace('/orders') },
        ]);
      }

      if (nextStatus === 'failed' || nextStatus === 'cancelled') {
        clearInterval(interval);
      }
    }, 4000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sessionId, clearCart]);

  const title = useMemo(() => {
    if (status === 'paid') return 'Paiement confirmé';
    if (status === 'failed') return 'Paiement échoué';
    if (status === 'cancelled') return 'Paiement annulé';
    return 'Paiement sécurisé CinetPay';
  }, [status]);

  const subtitle = useMemo(() => {
    if (status === 'paid') return 'Votre commande a été réglée avec succès.';
    if (status === 'failed') return 'Le paiement a échoué. Vous pouvez relancer la tentative depuis votre panier.';
    if (status === 'cancelled') return 'Le guichet a été fermé avant confirmation du paiement.';
    return 'Finalisez votre règlement sans quitter l application.';
  }, [status]);

  if (!sessionId || !checkoutUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <Text style={styles.title}>Session introuvable</Text>
          <Text style={styles.subtitle}>La session de paiement n a pas pu être ouverte.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTextBox}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {status === 'pending' ? (
        <>
          {checking ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={Colors.primary} />
              <Text style={styles.loadingText}>Vérification du paiement en cours...</Text>
            </View>
          ) : null}
          <WebView source={{ uri: checkoutUrl }} style={styles.webview} />
        </>
      ) : (
        <View style={styles.centerBox}>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/orders')}>
            <Text style={styles.primaryButtonText}>Aller à mes commandes</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  header: { padding: Spacing.md, backgroundColor: Colors.white, flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTextBox: { flex: 1, gap: 4 },
  title: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text.primary },
  subtitle: { fontSize: FontSizes.sm, color: Colors.text.secondary, lineHeight: 20 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, backgroundColor: Colors.white },
  loadingText: { color: Colors.text.secondary, fontSize: FontSizes.sm },
  webview: { flex: 1 },
  centerBox: { flex: 1, padding: Spacing.xl, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  primaryButton: { minHeight: 48, borderRadius: BorderRadius.lg, backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: Colors.white, fontWeight: '700' },
});
