import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Switch,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Shop, Product, Promotion } from '@/types/database';
import { ArrowLeft, Plus, Eye, Clock as Click, TrendingUp } from 'lucide-react-native';

export default function MerchantDashboardScreen() {
  const { user, profile } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '' });

  useEffect(() => {
    if (!user || !profile?.is_merchant) {
      router.replace('/shop/create-shop');
      return;
    }
    loadMerchantData();
  }, [user, profile]);

  const loadMerchantData = async () => {
    try {
      setLoading(true);
      const [shopRes, productsRes, promotionsRes] = await Promise.all([
        supabase
          .from('shops')
          .select('*')
          .eq('owner_id', user?.id)
          .maybeSingle(),
        supabase
          .from('products')
          .select('*')
          .eq('shop_id', user?.id),
        supabase
          .from('promotions')
          .select('*')
          .eq('shop_id', user?.id),
      ]);

      if (shopRes.data) setShop(shopRes.data);
      if (productsRes.data) setProducts(productsRes.data);
      if (promotionsRes.data) setPromotions(promotionsRes.data);
    } catch (error) {
      console.error('Error loading merchant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !shop) return;

    try {
      const { error } = await supabase.from('products').insert({
        shop_id: shop.id,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
      });

      if (error) throw error;

      setNewProduct({ name: '', price: '' });
      setShowNewProductForm(false);
      loadMerchantData();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleTogglePremium = async () => {
    if (!shop) return;

    try {
      const { error } = await supabase
        .from('shops')
        .update({ is_premium: !shop.is_premium })
        .eq('id', shop.id);

      if (error) throw error;
      setShop((prev) => prev ? { ...prev, is_premium: !prev.is_premium } : null);
    } catch (error) {
      console.error('Error toggling premium:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!shop) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Créer une boutique</Text>
          <Text style={styles.emptyStateText}>
            Vous n'avez pas encore créé de boutique. Commencez maintenant!
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/shop/create-shop')}>
            <Text style={styles.createButtonText}>Créer ma boutique</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tableau de bord</Text>
        </View>

        <View style={styles.shopCard}>
          <Text style={styles.shopName}>{shop.name}</Text>
          <Text style={styles.shopCategory}>{shop.category?.name_fr}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Eye size={24} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{shop.view_count}</Text>
              <Text style={styles.statLabel}>Vues</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Click size={24} color={Colors.secondary} />
              </View>
              <Text style={styles.statValue}>{shop.click_count}</Text>
              <Text style={styles.statLabel}>Clics</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <TrendingUp size={24} color={Colors.status.success} />
              </View>
              <Text style={styles.statValue}>{shop.rating_count}</Text>
              <Text style={styles.statLabel}>Avis</Text>
            </View>
          </View>

          <View style={styles.premiumSection}>
            <Text style={styles.premiumLabel}>Passer en Premium</Text>
            <Switch
              value={shop.is_premium}
              onValueChange={handleTogglePremium}
              trackColor={{ false: Colors.border.light, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Produits</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowNewProductForm(!showNewProductForm)}>
              <Plus size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {showNewProductForm && (
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Nom du produit"
                placeholderTextColor={Colors.text.secondary}
                value={newProduct.name}
                onChangeText={(text) =>
                  setNewProduct((prev) => ({ ...prev, name: text }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Prix en FCFA"
                placeholderTextColor={Colors.text.secondary}
                value={newProduct.price}
                onChangeText={(text) =>
                  setNewProduct((prev) => ({ ...prev, price: text }))
                }
                keyboardType="decimal-pad"
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddProduct}>
                <Text style={styles.saveButtonText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          )}

          {products.length > 0 ? (
            products.map((product) => (
              <View key={product.id} style={styles.productItem}>
                <View>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>
                    {product.price.toLocaleString('fr-CI')} FCFA
                  </Text>
                </View>
                <Text style={styles.productStatus}>
                  {product.is_available ? '✓' : '✕'}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Aucun produit</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Promotions</Text>
            <TouchableOpacity style={styles.addButton}>
              <Plus size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {promotions.length > 0 ? (
            promotions.map((promo) => (
              <View key={promo.id} style={styles.promoItem}>
                <View>
                  <Text style={styles.promoTitle}>{promo.title}</Text>
                  {promo.discount_percent && (
                    <Text style={styles.promoDiscount}>
                      -{promo.discount_percent}%
                    </Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Aucune promotion</Text>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  shopCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  shopName: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  shopCategory: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
  },
  statIcon: {
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  premiumSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  premiumLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  productName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  productPrice: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  productStatus: {
    fontSize: FontSizes.lg,
    color: Colors.status.success,
    fontWeight: '700',
  },
  promoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  promoTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  promoDiscount: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '700',
  },
  emptyText: {
    color: Colors.text.secondary,
    fontSize: FontSizes.md,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyStateTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
