import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { ArrowLeft, ShoppingBag, MapPin, MessageSquare } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { CartItemRow } from '@/components/CartDrawer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentMethod } from '@/types/database';

const PAYMENT_METHODS: { key: PaymentMethod; label: string; color: string }[] = [
  { key: 'wave',         label: '🌊 Wave',         color: '#FF6B35' },
  { key: 'orange_money', label: '🟠 Orange Money', color: '#FF7900' },
  { key: 'mtn_money',   label: '💛 MTN Money',    color: '#FFCC00' },
  { key: 'cash',         label: '💵 Espèces',       color: Colors.secondary },
];

export default function CartScreen() {
  const { user } = useAuth();
  const { items, totalAmount, clearCart, loading } = useCart();

  const [address, setAddress]             = useState('');
  const [notes, setNotes]                 = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [submitting, setSubmitting]       = useState(false);

  const deliveryFee = items.some((i) => i.shop?.has_delivery) ? 500 : 0;
  const grandTotal  = totalAmount + deliveryFee;

  // Regrouper les articles par boutique
  const shopGroups = items.reduce<Record<string, typeof items>>((acc, item) => {
    const key = item.shop_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const handleOrder = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (items.length === 0) return;

    try {
      setSubmitting(true);

      // Créer une commande par boutique
      for (const [shopId, shopItems] of Object.entries(shopGroups)) {
        const shopTotal = shopItems.reduce(
          (s, i) => s + i.product.price * i.quantity,
          0
        );

        const { data: order, error: orderErr } = await supabase
          .from('orders')
          .insert({
            user_id:          user.id,
            shop_id:          shopId,
            status:           'pending',
            total_amount:     shopTotal + deliveryFee,
            delivery_address: address || null,
            delivery_fee:     deliveryFee,
            payment_method:   paymentMethod,
            payment_status:   'pending',
            notes:            notes || null,
          })
          .select('id')
          .single();

        if (orderErr) throw orderErr;

        const orderItems = shopItems.map((i) => ({
          order_id:   order.id,
          product_id: i.product_id,
          name:       i.product.name,
          price:      i.product.price,
          quantity:   i.quantity,
        }));

        const { error: itemsErr } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsErr) throw itemsErr;
      }

      await clearCart();

      Alert.alert(
        'Commande passée ! 🎉',
        'Votre commande a été envoyée. Le commerçant vous contactera sous peu.',
        [{ text: 'Voir mes commandes', onPress: () => router.push('/orders') }]
      );
    } catch (err: any) {
      Alert.alert('Erreur', err.message ?? 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon panier</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearText}>Vider</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        /* Panier vide */
        <View style={styles.emptyState}>
          <ShoppingBag size={64} color={Colors.border.medium} />
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptySubtitle}>
            Explorez les boutiques et ajoutez des produits
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.push('/(tabs)')}>
            <Text style={styles.exploreBtnText}>Explorer les boutiques</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>

          {/* Articles par boutique */}
          {Object.entries(shopGroups).map(([shopId, shopItems]) => (
            <View key={shopId} style={styles.shopSection}>
              <Text style={styles.shopSectionTitle}>
                🏪 {shopItems[0].shop?.name ?? 'Boutique'}
              </Text>
              {shopItems.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </View>
          ))}

          {/* Adresse de livraison */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <MapPin size={16} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Adresse de livraison</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={address}
              onChangeText={setAddress}
              placeholder="Ajouter une adresse (optionnel)"
              placeholderTextColor={Colors.text.light}
              autoCapitalize="sentences"
              returnKeyType="done"
            />
          </View>

          {/* Note */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <MessageSquare size={16} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Note pour le commerçant</Text>
            </View>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Ajouter une note (optionnel)"
              placeholderTextColor={Colors.text.light}
              autoCapitalize="sentences"
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Mode de paiement */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mode de paiement</Text>
            <View style={styles.paymentGrid}>
              {PAYMENT_METHODS.map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[
                    styles.paymentBtn,
                    paymentMethod === m.key && {
                      borderColor: m.color,
                      backgroundColor: m.color + '12',
                    },
                  ]}
                  onPress={() => setPaymentMethod(m.key)}>
                  <Text
                    style={[
                      styles.paymentBtnText,
                      paymentMethod === m.key && { color: m.color, fontWeight: '700' },
                    ]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Récapitulatif */}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total</Text>
              <Text style={styles.summaryValue}>
                {totalAmount.toLocaleString('fr-CI')} FCFA
              </Text>
            </View>
            {deliveryFee > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Livraison</Text>
                <Text style={styles.summaryValue}>
                  {deliveryFee.toLocaleString('fr-CI')} FCFA
                </Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {grandTotal.toLocaleString('fr-CI')} FCFA
              </Text>
            </View>
          </View>

          {/* Bouton commander */}
          <TouchableOpacity
            style={[styles.orderBtn, submitting && styles.orderBtnDisabled]}
            onPress={handleOrder}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.orderBtnText}>
                Commander · {grandTotal.toLocaleString('fr-CI')} FCFA
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backBtn: { marginRight: Spacing.md },
  headerTitle: {
    flex: 1,
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  clearText: {
    fontSize: FontSizes.sm,
    color: Colors.status.error,
    fontWeight: '600',
  },
  scroll: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  shopSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  shopSectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minHeight: 44,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  notesInput: {
    minHeight: 92,
  },
  placeholder: {
    color: Colors.text.light,
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  paymentBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border.light,
    backgroundColor: Colors.white,
  },
  paymentBtnText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  summary: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
    gap: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  summaryValue: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  summaryTotal: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    marginTop: Spacing.xs,
  },
  totalLabel: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  totalValue: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.primary,
  },
  orderBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    ...Shadows.md,
  },
  orderBtnDisabled: { opacity: 0.6 },
  orderBtnText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  emptySubtitle: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  exploreBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  exploreBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSizes.md,
  },
});
