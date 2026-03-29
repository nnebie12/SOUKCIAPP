import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { SearchBar } from '@/components/SearchBar';
import { CategoryCard } from '@/components/CategoryCard';
import { ShopCard } from '@/components/ShopCard';
import { PromoCard } from '@/components/PromoCard';
import { supabase } from '@/lib/supabase';
import { Shop, Category, Promotion } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { MapPin, TrendingUp, Tag, Map, Clock } from 'lucide-react-native';
import { useSearchHistory } from '@/hooks/useSearchHistory';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredShops, setFeaturedShops] = useState<Shop[]>([]);
  const [popularShops, setPopularShops] = useState<Shop[]>([]);
  const [activePromos, setActivePromos] = useState<(Promotion & { shop?: { id: string; name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { history, addToHistory } = useSearchHistory();
  const [showHistory, setShowHistory] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [categoriesRes, shopsRes, favoritesRes, promosRes] = await Promise.all([
        supabase.from('categories').select('*').order('name_fr'),
        supabase
          .from('shops')
          .select('*, category:categories(*), city:cities(*)')
          .eq('is_active', true)
          .order('is_premium', { ascending: false })
          .order('rating_avg', { ascending: false })
          .limit(20),
        user
          ? supabase.from('favorites').select('shop_id').eq('user_id', user.id)
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from('promotions')
          .select('*, shop:shops(id, name)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(8),
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (shopsRes.data) {
        setFeaturedShops(shopsRes.data.filter((s) => s.is_premium).slice(0, 5));
        setPopularShops(shopsRes.data.slice(0, 10));
      }
      if (favoritesRes.data) {
        setFavorites(new Set(favoritesRes.data.map((f: any) => f.shop_id)));
      }
      if (promosRes.data) setActivePromos(promosRes.data as any);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (q) {
      addToHistory(q);
      router.push({ pathname: '/explore', params: { search: q } });
    }
  };

  const handleCategoryPress = (category: Category) => {
    router.push({ pathname: '/explore', params: { categoryId: category.id } });
  };

  const handleFavoritePress = async (shopId: string) => {
    if (!user) { router.push('/auth/login'); return; }
    try {
      if (favorites.has(shopId)) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('shop_id', shopId);
        setFavorites((prev) => { const s = new Set(prev); s.delete(shopId); return s; });
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, shop_id: shopId });
        setFavorites((prev) => new Set(prev).add(shopId));
      }
    } catch (error) { console.error(error); }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}{firstName ? ` ${firstName}` : ''} 👋
            </Text>
            <Text style={styles.headerTitle}>SoukCI</Text>
            <Text style={styles.headerSubtitle}>Découvrez les boutiques de Côte d'Ivoire</Text>
          </View>
          <TouchableOpacity style={styles.mapButton} onPress={() => router.push('/(tabs)/map')}>
            <Map size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchQuery}
            onChangeText={(t) => { setSearchQuery(t); setShowHistory(t.length === 0); }}
            onFocus={() => setShowHistory(searchQuery.length === 0 && history.length > 0)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            onClear={() => { setSearchQuery(''); setShowHistory(history.length > 0); }}
            onSubmitEditing={handleSearch}
          />
          {searchQuery.trim().length > 0 && (
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Rechercher</Text>
            </TouchableOpacity>
          )}
          {/* Search history */}
          {showHistory && history.length > 0 && (
            <View style={styles.historyBox}>
              <Text style={styles.historyLabel}>Récents</Text>
              {history.slice(0, 4).map((h) => (
                <TouchableOpacity
                  key={h}
                  style={styles.historyRow}
                  onPress={() => { setSearchQuery(h); setShowHistory(false); addToHistory(h); router.push({ pathname: '/explore', params: { search: h } }); }}>
                  <Clock size={13} color={Colors.text.light} />
                  <Text style={styles.historyRowText}>{h}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Active promos */}
        {activePromos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Tag size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Promotions en cours</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: '/explore', params: { hasPromo: '1' } })}>
                <Text style={styles.seeAll}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promoScroll}>
              {activePromos.map((promo) => (
                <PromoCard key={promo.id} promo={promo} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} onPress={() => handleCategoryPress(category)} />
            ))}
          </ScrollView>
        </View>

        {/* Featured shops */}
        {featuredShops.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Boutiques Premium</Text>
            </View>
            {featuredShops.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                onFavoritePress={() => handleFavoritePress(shop.id)}
                isFavorite={favorites.has(shop.id)}
              />
            ))}
          </View>
        )}

        {/* Popular */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={18} color={Colors.secondary} />
            <Text style={styles.sectionTitle}>Boutiques populaires</Text>
          </View>
          {popularShops.map((shop) => (
            <ShopCard
              key={shop.id}
              shop={shop}
              onFavoritePress={() => handleFavoritePress(shop.id)}
              isFavorite={favorites.has(shop.id)}
            />
          ))}
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.secondary },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  greeting: { fontSize: FontSizes.sm, color: Colors.text.secondary, marginBottom: 2 },
  headerTitle: { fontSize: FontSizes.xxxl, fontWeight: '800', color: Colors.primary },
  headerSubtitle: { fontSize: FontSizes.sm, color: Colors.text.secondary },
  mapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  searchWrapper: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg, zIndex: 10 },
  searchButton: {
    backgroundColor: Colors.primary, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg, marginTop: Spacing.sm, alignItems: 'center',
  },
  searchButtonText: { color: Colors.white, fontSize: FontSizes.md, fontWeight: '600' },
  historyBox: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginTop: Spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4,
  },
  historyLabel: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.text.secondary, marginBottom: Spacing.sm, textTransform: 'uppercase' },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6 },
  historyRowText: { fontSize: FontSizes.md, color: Colors.text.primary },
  section: { marginBottom: Spacing.xl, paddingHorizontal: Spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.sm },
  sectionTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.text.primary, flex: 1 },
  seeAll: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: '600' },
  catScroll: { marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg },
  promoScroll: { marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
});
