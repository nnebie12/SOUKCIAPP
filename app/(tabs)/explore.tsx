import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { SearchBar } from '@/components/SearchBar';
import { ShopCard } from '@/components/ShopCard';
import { supabase } from '@/lib/supabase';
import { Shop, Category, City } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalSearchParams, router } from 'expo-router';
import { ListFilter as Filter, MapPin, Star, Truck, Clock, Tag } from 'lucide-react-native';
import { useSearchHistory } from '@/hooks/useSearchHistory';

// Check if a shop is currently open based on its hours
function isShopOpenNow(hours?: { day_of_week: number; opens_at: string | null; closes_at: string | null; is_closed: boolean }[]): boolean {
  if (!hours || hours.length === 0) return true; // No hours info → assume open
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sunday
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayHours = hours.find((h) => h.day_of_week === dayOfWeek);
  if (!todayHours || todayHours.is_closed) return false;
  if (!todayHours.opens_at || !todayHours.closes_at) return true;
  const [openH, openM] = todayHours.opens_at.split(':').map(Number);
  const [closeH, closeM] = todayHours.closes_at.split(':').map(Number);
  return currentMinutes >= openH * 60 + openM && currentMinutes <= closeH * 60 + closeM;
}

export default function ExploreScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState((params.search as string) || '');
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const { history, addToHistory, removeFromHistory } = useSearchHistory();
  const [showHistory, setShowHistory] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [filters, setFilters] = useState({
    categoryId: (params.categoryId as string) || '',
    cityId: '',
    hasDelivery: false,
    isVerified: false,
    minRating: 0,
    isOpenNow: false,
    hasPromo: false,
  });

  useEffect(() => { loadCategories(); loadCities(); }, []);
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      if (searchQuery.trim().length >= 2) addToHistory(searchQuery.trim());
      loadShops();
    }, 400);
  }, [filters, searchQuery]);
  useEffect(() => { if (user) loadFavorites(); }, [user]);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name_fr');
    if (data) setCategories(data);
  };

  const loadCities = async () => {
    const { data } = await supabase.from('cities').select('*').order('name');
    if (data) setCities(data);
  };

  const loadShops = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('shops')
        .select('*, category:categories(*), city:cities(*), hours:shop_hours(*), promotions(*)')
        .eq('is_active', true);

      if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
      if (filters.cityId) query = query.eq('city_id', filters.cityId);
      if (filters.hasDelivery) query = query.eq('has_delivery', true);
      if (filters.isVerified) query = query.eq('is_verified', true);
      if (filters.minRating > 0) query = query.gte('rating_avg', filters.minRating);
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query
        .order('is_premium', { ascending: false })
        .order('rating_avg', { ascending: false })
        .limit(50);

      if (error) throw error;
      let result = data || [];

      // Client-side filters
      if (filters.isOpenNow) {
        result = result.filter((s: any) => isShopOpenNow(s.hours));
      }
      if (filters.hasPromo) {
        result = result.filter((s: any) => s.promotions && s.promotions.some((p: any) => p.is_active));
      }

      setShops(result);
    } catch (error) {
      console.error('Error loading shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (!user) return;
    const { data } = await supabase.from('favorites').select('shop_id').eq('user_id', user.id);
    if (data) setFavorites(new Set(data.map((f) => f.shop_id)));
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

  const clearFilters = () => {
    setFilters({ categoryId: '', cityId: '', hasDelivery: false, isVerified: false, minRating: 0, isOpenNow: false, hasPromo: false });
  };

  const activeFilterCount = [
    filters.categoryId,
    filters.cityId,
    filters.hasDelivery,
    filters.isVerified,
    filters.minRating > 0,
    filters.isOpenNow,
    filters.hasPromo,
  ].filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explorer</Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={(t) => { setSearchQuery(t); setShowHistory(t.length === 0 && history.length > 0); }}
          onFocus={() => setShowHistory(searchQuery.length === 0 && history.length > 0)}
          onBlur={() => setTimeout(() => setShowHistory(false), 200)}
          onClear={() => { setSearchQuery(''); setShowHistory(history.length > 0); }}
        />
        <TouchableOpacity
          style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}>
          <Filter size={20} color={activeFilterCount > 0 ? Colors.white : Colors.primary} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search history dropdown */}
      {showHistory && (
        <View style={styles.historyDropdown}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recherches récentes</Text>
            <TouchableOpacity onPress={() => { removeFromHistory(''); setShowHistory(false); }}>
              <Text style={styles.historyClear}>Tout effacer</Text>
            </TouchableOpacity>
          </View>
          {history.slice(0, 6).map((h) => (
            <TouchableOpacity
              key={h}
              style={styles.historyItem}
              onPress={() => { setSearchQuery(h); setShowHistory(false); }}>
              <Clock size={14} color={Colors.text.light} />
              <Text style={styles.historyItemText}>{h}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showFilters && (
        <ScrollView style={styles.filtersContainer} showsVerticalScrollIndicator={false}>
          {/* Quick toggles: Open now + Promos */}
          <View style={styles.filterSection}>
            <View style={styles.filterOptionsRow}>
              <TouchableOpacity
                style={[styles.filterChip, filters.isOpenNow && styles.filterChipActive]}
                onPress={() => setFilters((p) => ({ ...p, isOpenNow: !p.isOpenNow }))}>
                <Clock size={16} color={filters.isOpenNow ? Colors.white : Colors.text.secondary} />
                <Text style={[styles.filterChipText, filters.isOpenNow && styles.filterChipTextActive]}>
                  Ouvert maintenant
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filters.hasPromo && styles.filterChipActive]}
                onPress={() => setFilters((p) => ({ ...p, hasPromo: !p.hasPromo }))}>
                <Tag size={16} color={filters.hasPromo ? Colors.white : Colors.text.secondary} />
                <Text style={[styles.filterChipText, filters.hasPromo && styles.filterChipTextActive]}>
                  Promotions actives
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Catégorie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.filterChip, filters.categoryId === cat.id && styles.filterChipActive]}
                  onPress={() => setFilters((p) => ({ ...p, categoryId: p.categoryId === cat.id ? '' : cat.id }))}>
                  <Text style={[styles.filterChipText, filters.categoryId === cat.id && styles.filterChipTextActive]}>
                    {cat.name_fr}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Ville</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {cities.slice(0, 10).map((city) => (
                <TouchableOpacity
                  key={city.id}
                  style={[styles.filterChip, filters.cityId === city.id && styles.filterChipActive]}
                  onPress={() => setFilters((p) => ({ ...p, cityId: p.cityId === city.id ? '' : city.id }))}>
                  <Text style={[styles.filterChipText, filters.cityId === city.id && styles.filterChipTextActive]}>
                    {city.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Options</Text>
            <View style={styles.filterOptionsRow}>
              <TouchableOpacity
                style={[styles.filterChip, filters.hasDelivery && styles.filterChipActive]}
                onPress={() => setFilters((p) => ({ ...p, hasDelivery: !p.hasDelivery }))}>
                <Truck size={16} color={filters.hasDelivery ? Colors.white : Colors.text.secondary} />
                <Text style={[styles.filterChipText, filters.hasDelivery && styles.filterChipTextActive]}>Livraison</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filters.isVerified && styles.filterChipActive]}
                onPress={() => setFilters((p) => ({ ...p, isVerified: !p.isVerified }))}>
                <Text style={[styles.filterChipText, filters.isVerified && styles.filterChipTextActive]}>Vérifiées</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filters.minRating >= 4 && styles.filterChipActive]}
                onPress={() => setFilters((p) => ({ ...p, minRating: p.minRating >= 4 ? 0 : 4 }))}>
                <Star size={16} color={filters.minRating >= 4 ? Colors.white : Colors.text.secondary} fill={filters.minRating >= 4 ? Colors.white : 'transparent'} />
                <Text style={[styles.filterChipText, filters.minRating >= 4 && styles.filterChipTextActive]}>4+ étoiles</Text>
              </TouchableOpacity>
            </View>
          </View>

          {activeFilterCount > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Réinitialiser ({activeFilterCount})</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {shops.length} boutique{shops.length > 1 ? 's' : ''} trouvée{shops.length > 1 ? 's' : ''}
        </Text>
        {activeFilterCount > 0 && (
          <Text style={styles.activeFiltersText}>{activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''} actif{activeFilterCount > 1 ? 's' : ''}</Text>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.shopsList} showsVerticalScrollIndicator={false}>
          {shops.length > 0 ? (
            shops.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                onFavoritePress={() => handleFavoritePress(shop.id)}
                isFavorite={favorites.has(shop.id)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Aucune boutique trouvée</Text>
              <Text style={styles.emptyStateSubtext}>Essayez de modifier vos filtres de recherche</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.text.primary },
  searchContainer: { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md, gap: Spacing.sm },
  filterButton: { width: 50, height: 50, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, justifyContent: 'center', alignItems: 'center' },
  filterButtonActive: { backgroundColor: Colors.primary },
  filterBadge: {
    position: 'absolute', top: -4, right: -4, width: 18, height: 18,
    borderRadius: 9, backgroundColor: Colors.status.error,
    justifyContent: 'center', alignItems: 'center',
  },
  filterBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  historyDropdown: {
    marginHorizontal: Spacing.lg, backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    marginBottom: Spacing.sm, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  historyTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.text.primary },
  historyClear: { fontSize: FontSizes.sm, color: Colors.status.error, fontWeight: '600' },
  historyItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  historyItemText: { fontSize: FontSizes.md, color: Colors.text.secondary },
  filtersContainer: { maxHeight: 280, marginBottom: Spacing.md, paddingHorizontal: Spacing.lg },
  filterSection: { marginBottom: Spacing.md },
  filterLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text.primary, marginBottom: Spacing.sm },
  filterOptionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round, marginRight: Spacing.sm, gap: 4,
  },
  filterChipActive: { backgroundColor: Colors.primary },
  filterChipText: { fontSize: FontSizes.sm, color: Colors.text.primary },
  filterChipTextActive: { color: Colors.white, fontWeight: '600' },
  clearButton: {
    backgroundColor: Colors.status.error, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, borderRadius: BorderRadius.round, alignSelf: 'flex-start', marginBottom: Spacing.md,
  },
  clearButtonText: { color: Colors.white, fontSize: FontSizes.sm, fontWeight: '600' },
  resultsHeader: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultsCount: { fontSize: FontSizes.md, color: Colors.text.secondary },
  activeFiltersText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  shopsList: { flex: 1, paddingHorizontal: Spacing.lg },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyStateText: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.text.primary, marginBottom: Spacing.sm },
  emptyStateSubtext: { fontSize: FontSizes.md, color: Colors.text.secondary },
});
