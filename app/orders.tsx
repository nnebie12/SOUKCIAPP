import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Order, OrderStatus } from '@/types/database';
import { router } from 'expo-router';
import { ArrowLeft, ChevronRight, Clock, Package } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Status config ────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:    { label: 'En attente',  color: Colors.status.warning,  bg: Colors.status.warning + '18' },
  confirmed:  { label: 'Confirmée',   color: Colors.status.info,     bg: Colors.status.info + '18' },
  preparing:  { label: 'En prépa.',   color: Colors.primary,         bg: Colors.primary + '18' },
  ready:      { label: 'Prête',       color: Colors.secondary,       bg: Colors.secondary + '18' },
  delivered:  { label: 'Livrée',      color: Colors.status.success,  bg: Colors.status.success + '18' },
  cancelled:  { label: 'Annulée',     color: Colors.status.error,    bg: Colors.status.error + '18' },
};

const FILTERS: { key: 'all' | OrderStatus; label: string }[] = [
  { key: 'all',       label: 'Toutes' },
  { key: 'pending',   label: 'En attente' },
  { key: 'confirmed', label: 'Confirmées' },
  { key: 'delivered', label: 'Livrées' },
  { key: 'cancelled', label: 'Annulées' },
];

// ─── OrderCard ────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const cfg = STATUS_CONFIG[order.status];
  const date = new Date(order.created_at).toLocaleDateString('fr-CI', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = new Date(order.created_at).toLocaleTimeString('fr-CI', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      {/* En-tête */}
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Package size={18} color={Colors.primary} />
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.shopName} numberOfLines={1}>
            {order.shop?.name ?? 'Boutique'}
          </Text>
          <View style={styles.dateRow}>
            <Clock size={12} color={Colors.text.light} />
            <Text style={styles.dateText}>
              {date} à {time}
            </Text>
          </View>
        </View>
        <ChevronRight size={18} color={Colors.border.medium} />
      </View>

      {/* Items résumé */}
      {order.order_items && order.order_items.length > 0 && (
        <Text style={styles.itemsSummary} numberOfLines={1}>
          {order.order_items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
        </Text>
      )}

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.color }]}>
            {cfg.label}
          </Text>
        </View>
        <Text style={styles.amount}>
          {order.total_amount.toLocaleString('fr-CI')} FCFA
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]       = useState<'all' | OrderStatus>('all');

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `*, shop:shops(id, name, photo_url), order_items(*)`
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data as Order[]) ?? []);
    } catch (err) {
      console.error('[OrdersScreen]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered =
    filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Package size={56} color={Colors.border.medium} />
          <Text style={styles.emptyTitle}>Connectez-vous</Text>
          <Text style={styles.emptySubtitle}>
            Pour voir vos commandes, vous devez être connecté.
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginBtnText}>Se connecter</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Mes commandes</Text>
      </View>

      {/* Filtres */}
      <FlatList
        data={FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(f) => f.key}
        contentContainerStyle={styles.filters}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === item.key && styles.filterChipActive,
            ]}
            onPress={() => setFilter(item.key)}>
            <Text
              style={[
                styles.filterText,
                filter === item.key && styles.filterTextActive,
              ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Liste */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(o) => o.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Package size={56} color={Colors.border.medium} />
              <Text style={styles.emptyTitle}>Aucune commande</Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'all'
                  ? 'Vous n\'avez pas encore passé de commande.'
                  : 'Aucune commande avec ce statut.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
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
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  filters: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  filterTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMeta: { flex: 1 },
  shopName: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dateText: {
    fontSize: FontSizes.xs,
    color: Colors.text.light,
  },
  itemsSummary: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  amount: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text.primary,
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
  loginBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  loginBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSizes.md,
  },
});
