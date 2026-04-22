import { ReviewCard } from '@/components/ReviewCard';
import { MiniChart, StatsCard } from '@/components/StatsCard';
import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useBilling } from '@/contexts/BillingContext';
import { useStats } from '@/hooks/useStats';
import { supabase } from '@/lib/supabase';
import { Order, Product, Review, Shop } from '@/types/database';
import { router } from 'expo-router';
import {
    ArrowLeft,
    Clock as Click,
    Eye,
    Megaphone,
    Package,
    Plus,
    ShoppingBag,
    Star,
    TrendingUp,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Tabs ─────────────────────────────────────────────────────────

type Tab = 'overview' | 'orders' | 'products' | 'reviews';

const TABS: { key: Tab; label: string; icon: typeof Eye }[] = [
  { key: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
  { key: 'orders',   label: 'Commandes',       icon: ShoppingBag },
  { key: 'products', label: 'Produits',         icon: Package },
  { key: 'reviews',  label: 'Avis',             icon: Star },
];

export default function MerchantDashboardScreen() {
  const { user, profile } = useAuth();
  const { hasPremiumEntitlement, refreshCustomerInfo } = useBilling();

  const [shop, setShop]             = useState<Shop | null>(null);
  const [products, setProducts]     = useState<Product[]>([]);
  const [orders, setOrders]         = useState<Order[]>([]);
  const [reviews, setReviews]       = useState<Review[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab]   = useState<Tab>('overview');

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });

  // Reply state
  const [replyingTo, setReplyingTo]   = useState<string | null>(null);
  const [replyText, setReplyText]     = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const { stats } = useStats(shop?.id ?? null);

  // ── Data loading ─────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const { data: shopData } = await supabase
        .from('shops')
        .select('*, category:categories(*), city:cities(*)')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (!shopData) {
        setLoading(false);
        setRefreshing(false);
        return;
      }
      setShop(shopData as Shop);

      const [prodRes, ordRes, revRes] = await Promise.all([
        supabase.from('products').select('*').eq('shop_id', shopData.id).order('created_at', { ascending: false }),
        supabase.from('orders').select('*, order_items(*)').eq('shop_id', shopData.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('reviews').select('*, user_profile:user_profiles(id, full_name, avatar_url)').eq('shop_id', shopData.id).order('created_at', { ascending: false }),
      ]);

      if (prodRes.data) setProducts(prodRes.data as Product[]);
      if (ordRes.data)  setOrders(ordRes.data as Order[]);
      if (revRes.data)  setReviews(revRes.data as Review[]);
    } catch (err) {
      console.error('[MerchantDashboard]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user || !profile?.is_merchant) {
      router.replace('/shop/create-shop');
      return;
    }
    loadData();
  }, [user, profile, loadData]);

  useEffect(() => {
    if (!shop?.id || !hasPremiumEntitlement || shop.is_premium) return;

    const syncPremium = async () => {
      const { error } = await supabase.functions.invoke('sync-merchant-premium', {
        body: { shopId: shop.id },
      });

      if (!error) {
        loadData();
      }
    };

    void syncPremium();
  }, [shop?.id, shop?.is_premium, hasPremiumEntitlement, loadData]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !shop) return;
    try {
      const { error } = await supabase.from('products').insert({
        shop_id:     shop.id,
        name:        newProduct.name,
        description: newProduct.description || null,
        price:       parseFloat(newProduct.price),
      });
      if (error) throw error;
      setNewProduct({ name: '', price: '', description: '' });
      setShowProductForm(false);
      loadData();
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    }
  };

  const handleTogglePremium = async () => {
    if (!shop) return;
    if (shop.is_premium) {
      try {
        await refreshCustomerInfo();
        const { error } = await supabase.functions.invoke('sync-merchant-premium', {
          body: { shopId: shop.id },
        });
        if (error) throw error;
        await loadData();
        Alert.alert('Premium synchronisé', 'Votre statut Premium a été resynchronisé depuis RevenueCat.');
      } catch (err: any) {
        Alert.alert('Synchronisation impossible', err.message ?? 'Le statut Premium n a pas pu être synchronisé.');
      }
      return;
    }

    router.push('/shop/premium');
  };

  const handleToggleProductAvailability = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_available: !product.is_available })
      .eq('id', product.id);
    if (!error) {
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, is_available: !p.is_available } : p)
      );
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    if (!error) {
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status: status as any } : o)
      );
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    try {
      setSubmittingReply(true);
      const { error } = await supabase
        .from('reviews')
        .update({ merchant_reply: replyText.trim(), merchant_reply_at: new Date().toISOString() })
        .eq('id', reviewId);
      if (error) throw error;
      setReplyingTo(null);
      setReplyText('');
      loadData();
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    } finally {
      setSubmittingReply(false);
    }
  };

  // ── Loading / no shop ────────────────────────────────────────────
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Aucune boutique</Text>
          <Text style={styles.emptySubtitle}>
            Commencez par créer votre boutique.
          </Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => router.push('/shop/create-shop')}>
            <Text style={styles.createBtnText}>Créer ma boutique</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{shop.name}</Text>
          <Text style={styles.headerSub}>{shop.category?.name_fr}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/campaigns')}>
          <Megaphone size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}>
              <Icon size={16} color={active ? Colors.primary : Colors.text.secondary} />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
                {tab.key === 'orders' && pendingOrdersCount > 0
                  ? ` (${pendingOrdersCount})`
                  : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadData(); }}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }>

        {/* ── TAB: Overview ── */}
        {activeTab === 'overview' && (
          <>
            {/* Stats cards */}
            <View style={styles.statsGrid}>
              <StatsCard label="Vues"  value={stats?.views  ?? shop.view_count}  icon={Eye}    iconColor={Colors.primary}         compact />
              <StatsCard label="Clics" value={stats?.clicks ?? shop.click_count} icon={Click}  iconColor={Colors.secondary}       compact />
              <StatsCard label="Avis"  value={stats?.reviewCount ?? shop.rating_count} icon={Star} iconColor={Colors.status.warning} compact />
            </View>

            <View style={[styles.statsGrid, { marginTop: Spacing.sm }]}>
              <StatsCard
                label="Commandes"
                value={stats?.ordersTotal ?? 0}
                icon={ShoppingBag}
                iconColor={Colors.status.info}
                compact
              />
              <StatsCard
                label="Revenus"
                value={stats ? `${(stats.ordersRevenue / 1000).toFixed(0)}k` : '—'}
                suffix=" FCFA"
                icon={TrendingUp}
                iconColor={Colors.status.success}
                compact
              />
              <StatsCard
                label="Impressions"
                value={stats?.campaignImpressions ?? 0}
                icon={Megaphone}
                iconColor={Colors.primaryDark}
                compact
              />
            </View>

            {/* Mini charts */}
            {stats && (
              <View style={styles.chartsRow}>
                <View style={{ flex: 1 }}>
                  <MiniChart
                    data={stats.weeklyViews}
                    color={Colors.primary}
                    label="Vues — 7 jours"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <MiniChart
                    data={stats.weeklyOrders}
                    color={Colors.secondary}
                    label="Commandes — 7 jours"
                  />
                </View>
              </View>
            )}

            {/* Premium toggle */}
            <View style={styles.card}>
              <View style={styles.premiumRow}>
                <View style={styles.premiumInfo}>
                  <Text style={styles.premiumTitle}>Mode Premium</Text>
                  <Text style={styles.premiumSub}>
                    {shop.is_premium
                      ? 'Votre boutique est mise en avant et vos campagnes peuvent être activées.'
                      : 'Activez l abonnement Premium pour débloquer la mise en avant et les campagnes.'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.premiumCta} onPress={handleTogglePremium}>
                  <Text style={styles.premiumCtaText}>{shop.is_premium ? 'Synchroniser' : 'Activer'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Raccourcis */}
            <View style={styles.shortcuts}>
              <TouchableOpacity
                style={styles.shortcut}
                onPress={() => router.push('/campaigns')}>
                <Megaphone size={20} color={Colors.primary} />
                <Text style={styles.shortcutText}>Lancer une campagne</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shortcut}
                onPress={() => setActiveTab('orders')}>
                <ShoppingBag size={20} color={Colors.secondary} />
                <Text style={styles.shortcutText}>
                  Voir les commandes{pendingOrdersCount > 0 ? ` (${pendingOrdersCount})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── TAB: Orders ── */}
        {activeTab === 'orders' && (
          <>
            {orders.length === 0 ? (
              <Text style={styles.emptyText}>Aucune commande reçue</Text>
            ) : (
              orders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderDate}>
                      {new Date(order.created_at).toLocaleDateString('fr-CI', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </Text>
                    <Text style={[
                      styles.orderStatus,
                      { color: order.status === 'delivered' ? Colors.status.success : Colors.primary }
                    ]}>
                      {order.status.toUpperCase()}
                    </Text>
                  </View>
                  {order.order_items?.map((item: any) => (
                    <Text key={item.id} style={styles.orderItem}>
                      {item.quantity}× {item.name} — {(item.price * item.quantity).toLocaleString('fr-CI')} FCFA
                    </Text>
                  ))}
                  <View style={styles.orderFooter}>
                    <Text style={styles.orderTotal}>
                      Total : {order.total_amount.toLocaleString('fr-CI')} FCFA
                    </Text>
                    {order.status === 'pending' && (
                      <TouchableOpacity
                        style={styles.confirmBtn}
                        onPress={() => handleUpdateOrderStatus(order.id, 'confirmed')}>
                        <Text style={styles.confirmBtnText}>Confirmer</Text>
                      </TouchableOpacity>
                    )}
                    {order.status === 'confirmed' && (
                      <TouchableOpacity
                        style={styles.confirmBtn}
                        onPress={() => handleUpdateOrderStatus(order.id, 'preparing')}>
                        <Text style={styles.confirmBtnText}>En préparation</Text>
                      </TouchableOpacity>
                    )}
                    {order.status === 'preparing' && (
                      <TouchableOpacity
                        style={styles.confirmBtn}
                        onPress={() => handleUpdateOrderStatus(order.id, 'ready')}>
                        <Text style={styles.confirmBtnText}>Prêt</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* ── TAB: Products ── */}
        {activeTab === 'products' && (
          <>
            <TouchableOpacity
              style={styles.addProductBtn}
              onPress={() => setShowProductForm(!showProductForm)}>
              <Plus size={18} color={Colors.white} />
              <Text style={styles.addProductBtnText}>Ajouter un produit</Text>
            </TouchableOpacity>

            {showProductForm && (
              <View style={styles.card}>
                <TextInput
                  style={styles.input}
                  placeholder="Nom du produit *"
                  placeholderTextColor={Colors.text.light}
                  value={newProduct.name}
                  onChangeText={(t) => setNewProduct((p) => ({ ...p, name: t }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Description (optionnel)"
                  placeholderTextColor={Colors.text.light}
                  value={newProduct.description}
                  onChangeText={(t) => setNewProduct((p) => ({ ...p, description: t }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Prix en FCFA *"
                  placeholderTextColor={Colors.text.light}
                  value={newProduct.price}
                  onChangeText={(t) => setNewProduct((p) => ({ ...p, price: t }))}
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity style={styles.saveBtn} onPress={handleAddProduct}>
                  <Text style={styles.saveBtnText}>Enregistrer</Text>
                </TouchableOpacity>
              </View>
            )}

            {products.length === 0 ? (
              <Text style={styles.emptyText}>Aucun produit — ajoutez-en un !</Text>
            ) : (
              products.map((p) => (
                <View key={p.id} style={styles.productCard}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{p.name}</Text>
                    {p.description ? (
                      <Text style={styles.productDesc} numberOfLines={1}>{p.description}</Text>
                    ) : null}
                    <Text style={styles.productPrice}>
                      {p.price.toLocaleString('fr-CI')} FCFA
                    </Text>
                  </View>
                  <Switch
                    value={p.is_available}
                    onValueChange={() => handleToggleProductAvailability(p)}
                    trackColor={{ false: Colors.border.light, true: Colors.secondary }}
                    thumbColor={Colors.white}
                  />
                </View>
              ))
            )}
          </>
        )}

        {/* ── TAB: Reviews ── */}
        {activeTab === 'reviews' && (
          <>
            {reviews.length === 0 ? (
              <Text style={styles.emptyText}>Aucun avis pour l'instant</Text>
            ) : (
              reviews.map((r) => (
                <View key={r.id}>
                  <ReviewCard
                    review={r}
                    isMerchantView
                    onReply={(id) => { setReplyingTo(id); setReplyText(''); }}
                  />
                  {replyingTo === r.id && (
                    <View style={styles.replyForm}>
                      <TextInput
                        style={styles.replyInput}
                        placeholder="Votre réponse..."
                        placeholderTextColor={Colors.text.light}
                        value={replyText}
                        onChangeText={setReplyText}
                        multiline
                      />
                      <View style={styles.replyActions}>
                        <TouchableOpacity
                          style={styles.replyCancelBtn}
                          onPress={() => setReplyingTo(null)}>
                          <Text style={styles.replyCancelText}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.replySendBtn}
                          onPress={() => handleReply(r.id)}
                          disabled={submittingReply}>
                          {submittingReply ? (
                            <ActivityIndicator color={Colors.white} size="small" />
                          ) : (
                            <Text style={styles.replySendText}>Répondre</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Colors.background.secondary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.secondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backBtn:    { marginRight: Spacing.md },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text.primary },
  headerSub:   { fontSize: FontSizes.xs, color: Colors.primary },
  tabBar:        { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border.light, maxHeight: 52 },
  tabBarContent: { paddingHorizontal: Spacing.md, gap: Spacing.xs, alignItems: 'center' },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
  },
  tabActive:     { backgroundColor: Colors.primary + '15' },
  tabText:       { fontSize: FontSizes.sm, color: Colors.text.secondary },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.md },
  statsGrid: { flexDirection: 'row', gap: Spacing.sm },
  chartsRow:  { flexDirection: 'row', gap: Spacing.sm },
  card: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, ...Shadows.sm },
  premiumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  premiumInfo: { flex: 1, marginRight: Spacing.md },
  premiumTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.text.primary },
  premiumSub:   { fontSize: FontSizes.xs, color: Colors.text.secondary, marginTop: 2 },
  premiumCta: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
    minHeight: 40,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumCtaText: { color: Colors.white, fontSize: FontSizes.sm, fontWeight: '700' },
  shortcuts: { flexDirection: 'row', gap: Spacing.sm },
  shortcut: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  shortcutText: { fontSize: FontSizes.xs, color: Colors.text.primary, textAlign: 'center', fontWeight: '600' },

  // Orders
  orderCard:   { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, ...Shadows.sm },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  orderDate:   { fontSize: FontSizes.xs, color: Colors.text.secondary },
  orderStatus: { fontSize: FontSizes.xs, fontWeight: '700' },
  orderItem:   { fontSize: FontSizes.sm, color: Colors.text.primary, marginBottom: 2 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border.light },
  orderTotal:  { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.text.primary },
  confirmBtn:  { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.md },
  confirmBtnText: { color: Colors.white, fontSize: FontSizes.xs, fontWeight: '700' },

  // Products
  addProductBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  addProductBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSizes.md },
  input: { backgroundColor: Colors.background.secondary, borderRadius: BorderRadius.lg, padding: Spacing.md, fontSize: FontSizes.md, color: Colors.text.primary, marginBottom: Spacing.sm },
  saveBtn: { backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center' },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSizes.md },
  productCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.md, ...Shadows.sm },
  productInfo: { flex: 1, marginRight: Spacing.md },
  productName:  { fontSize: FontSizes.md, fontWeight: '700', color: Colors.text.primary },
  productDesc:  { fontSize: FontSizes.xs, color: Colors.text.secondary, marginTop: 2 },
  productPrice: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: '700', marginTop: 4 },

  // Reviews reply
  replyForm:       { backgroundColor: Colors.background.secondary, borderRadius: BorderRadius.lg, padding: Spacing.md, marginTop: -Spacing.sm, marginBottom: Spacing.sm },
  replyInput:      { backgroundColor: Colors.white, borderRadius: BorderRadius.md, padding: Spacing.sm, fontSize: FontSizes.sm, color: Colors.text.primary, minHeight: 60, textAlignVertical: 'top', marginBottom: Spacing.sm },
  replyActions:    { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm },
  replyCancelBtn:  { paddingHorizontal: Spacing.md, paddingVertical: 6 },
  replyCancelText: { fontSize: FontSizes.sm, color: Colors.text.secondary },
  replySendBtn:    { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.md },
  replySendText:   { color: Colors.white, fontSize: FontSizes.sm, fontWeight: '700' },

  // Empty
  emptyText: { textAlign: 'center', color: Colors.text.secondary, paddingVertical: Spacing.xl },
  emptyState:   { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxl, gap: Spacing.md },
  emptyTitle:   { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.text.primary },
  emptySubtitle: { fontSize: FontSizes.md, color: Colors.text.secondary, textAlign: 'center' },
  createBtn:    { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  createBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSizes.md },
});
