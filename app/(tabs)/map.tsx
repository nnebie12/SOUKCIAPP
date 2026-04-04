import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Shop } from '@/types/database';
import { MapPin, Navigation, Minus, Plus, X } from 'lucide-react-native';
import { router } from 'expo-router';

const RADIUS_OPTIONS = [1, 2, 5, 10, 20];

interface NearbyShop extends Shop {
  distance?: number;
}

// Haversine formula
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function MapScreen() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [shops, setShops] = useState<NearbyShop[]>([]);
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState(5);
  const [selectedShop, setSelectedShop] = useState<NearbyShop | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const requestLocation = useCallback(async () => {
    setLocationLoading(true);
    setLocationError(null);

    if (Platform.OS === 'web') {
      if (!navigator.geolocation) {
        setLocationError('Géolocalisation non supportée par votre navigateur.');
        setLocationLoading(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationLoading(false);
        },
        () => {
          // Fallback to Abidjan center
          setLocation({ lat: 5.3599517, lng: -4.0082563 });
          setLocationLoading(false);
        },
        { timeout: 10000 }
      );
    } else {
      // On native, use expo-location (must be installed)
      try {
        // Dynamic import for native
        const Location = await import('expo-location');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Permission de localisation refusée.');
          setLocation({ lat: 5.3599517, lng: -4.0082563 });
        } else {
          const pos = await Location.getCurrentPositionAsync({});
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        }
      } catch {
        setLocation({ lat: 5.3599517, lng: -4.0082563 });
      }
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    if (location) loadNearbyShops();
  }, [location, radius]);

  const loadNearbyShops = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('shops')
        .select('*, category:categories(*), city:cities(*)')
        .eq('is_active', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (data) {
        const withDistance: NearbyShop[] = data
          .map((shop) => ({
            ...shop,
            distance: getDistance(location.lat, location.lng, shop.latitude!, shop.longitude!),
          }))
          .filter((shop) => shop.distance! <= radius)
          .sort((a, b) => a.distance! - b.distance!);

        setShops(withDistance);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = (shop: NearbyShop) => {
    if (!shop.latitude || !shop.longitude) return;
    const url =
      Platform.OS === 'ios'
        ? `maps:?q=${shop.name}&ll=${shop.latitude},${shop.longitude}`
        : `geo:${shop.latitude},${shop.longitude}?q=${encodeURIComponent(shop.name)}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${shop.latitude},${shop.longitude}`
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Carte</Text>
        <Text style={styles.headerSub}>
          {location ? `${shops.length} boutique${shops.length > 1 ? 's' : ''} à ${radius} km` : 'Localisation en cours...'}
        </Text>
      </View>

      {/* Map placeholder / iframe for web */}
      <View style={styles.mapContainer}>
        {location ? (
          Platform.OS === 'web' ? (
            <iframe
              title="map"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.1},${location.lat - 0.1},${location.lng + 0.1},${location.lat + 0.1}&layer=mapnik&marker=${location.lat},${location.lng}`}
            />
          ) : (
            <View style={styles.mapNativePlaceholder}>
              <MapPin size={48} color={Colors.primary} />
              <Text style={styles.mapPlaceholderText}>
                Carte — {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </Text>
              <Text style={styles.mapPlaceholderSub}>
                Installez react-native-maps pour une carte native
              </Text>
            </View>
          )
        ) : (
          <View style={styles.mapNativePlaceholder}>
            {locationLoading ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
              <>
                <Navigation size={48} color={Colors.text.secondary} />
                <Text style={styles.mapPlaceholderText}>
                  {locationError || 'Localisation requise'}
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={requestLocation}>
                  <Text style={styles.retryText}>Réessayer</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>

      {/* Radius control */}
      <View style={styles.radiusControl}>
        <Text style={styles.radiusLabel}>Rayon :</Text>
        <View style={styles.radiusButtons}>
          {RADIUS_OPTIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.radiusBtn, radius === r && styles.radiusBtnActive]}
              onPress={() => setRadius(r)}>
              <Text style={[styles.radiusBtnText, radius === r && styles.radiusBtnTextActive]}>
                {r} km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Nearby shops list */}
      {loading ? (
        <ActivityIndicator style={styles.loader} color={Colors.primary} />
      ) : (
        <ScrollView style={styles.shopList} showsVerticalScrollIndicator={false}>
          {shops.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucune boutique dans ce rayon</Text>
              <Text style={styles.emptySubtext}>Augmentez le rayon de recherche</Text>
            </View>
          ) : (
            shops.map((shop) => (
              <TouchableOpacity
                key={shop.id}
                style={styles.shopRow}
                onPress={() => router.push({ pathname: '/shop/[id]', params: { id: shop.id } })}>
                <View style={styles.shopRowLeft}>
                  <View style={styles.shopIcon}>
                    <MapPin size={18} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.shopRowName}>{shop.name}</Text>
                    <Text style={styles.shopRowMeta}>
                      {shop.category?.name_fr} • {shop.distance?.toFixed(1)} km
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => openInMaps(shop)} style={styles.navButton}>
                  <Navigation size={18} color={Colors.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Selected shop modal */}
      {selectedShop && (
        <View style={styles.shopModal}>
          <View style={styles.shopModalHeader}>
            <Text style={styles.shopModalName}>{selectedShop.name}</Text>
            <TouchableOpacity onPress={() => setSelectedShop(null)}>
              <X size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.shopModalDist}>
            {selectedShop.distance?.toFixed(1)} km • {selectedShop.category?.name_fr}
          </Text>
          <TouchableOpacity
            style={styles.shopModalButton}
            onPress={() => router.push({ pathname: '/shop/[id]', params: { id: selectedShop.id } })}>
            <Text style={styles.shopModalButtonText}>Voir la boutique</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  headerSub: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  mapContainer: {
    height: 240,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.background.tertiary,
    ...Shadows.md,
  },
  mapNativePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  mapPlaceholderText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  mapPlaceholderSub: {
    fontSize: FontSizes.sm,
    color: Colors.text.light,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
  },
  retryText: { color: Colors.white, fontWeight: '700', fontSize: FontSizes.sm },
  radiusControl: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  radiusLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  radiusButtons: { flexDirection: 'row', gap: Spacing.sm },
  radiusBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  radiusBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  radiusBtnText: { fontSize: FontSizes.sm, color: Colors.text.secondary, fontWeight: '600' },
  radiusBtnTextActive: { color: Colors.white },
  loader: { marginTop: Spacing.xl },
  shopList: { flex: 1, paddingHorizontal: Spacing.lg },
  emptyState: { alignItems: 'center', paddingTop: Spacing.xl },
  emptyText: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.text.primary },
  emptySubtext: { fontSize: FontSizes.sm, color: Colors.text.secondary, marginTop: Spacing.sm },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  shopRowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  shopIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopRowName: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.text.primary },
  shopRowMeta: { fontSize: FontSizes.sm, color: Colors.text.secondary, marginTop: 2 },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopModal: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  shopModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  shopModalName: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text.primary },
  shopModalDist: { fontSize: FontSizes.sm, color: Colors.text.secondary, marginBottom: Spacing.md },
  shopModalButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  shopModalButtonText: { color: Colors.white, fontWeight: '700', fontSize: FontSizes.md },
});
