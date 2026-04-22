import { itemWithOptionalFallback } from '@/constants/runtime';
import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '@/constants/theme';
import { MOCK_SHOPS_WITH_RELATIONS } from '@/data/mockData';
import { useReviews } from '@/hooks/useReviews';
import { supabase } from '@/lib/supabase';
import { Shop } from '@/types/database';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Phone, Share2, Star } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ShopDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const shopId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const { reviews, loading: reviewsLoading } = useReviews({ shopId: shopId ?? '', autoLoad: Boolean(shopId) });

  useEffect(() => {
    if (!shopId) {
      setLoading(false);
      return;
    }

    const loadShop = async () => {
      try {
        const { data } = await supabase
          .from('shops')
          .select('*, category:categories(*), city:cities(*)')
          .eq('id', shopId)
          .maybeSingle();

        const fallback = MOCK_SHOPS_WITH_RELATIONS.find((item) => item.id === shopId) ?? null;
        setShop(itemWithOptionalFallback(data as Shop | null, fallback));
      } finally {
        setLoading(false);
      }
    };

    loadShop();
  }, [shopId]);

  const paymentMethods = useMemo(() => {
    if (!shop) return [];
    return [
      shop.accepts_wave ? 'Wave' : null,
      shop.accepts_orange_money ? 'Orange Money' : null,
      shop.accepts_mtn_money ? 'MTN Money' : null,
    ].filter(Boolean) as string[];
  }, [shop]);

  const handleCall = async () => {
    if (!shop?.phone) return;
    try {
      await Linking.openURL(`tel:${shop.phone}`);
    } catch {
      Alert.alert('Appel impossible', 'Aucun composeur téléphonique disponible.');
    }
  };

  const handleShare = async () => {
    if (!shop) return;
    const address = [shop.address, shop.city?.name].filter(Boolean).join(', ');
    try {
      await Linking.openURL(`sms:&body=${encodeURIComponent(`${shop.name}${address ? ` - ${address}` : ''}`)}`);
    } catch {
      Alert.alert('Partage impossible', 'Le partage n’a pas pu être lancé.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!shop) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={20} color={Colors.text.primary} />
            <Text style={styles.backText}>Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Boutique introuvable</Text>
          <Text style={styles.subtitle}>Cette boutique n’existe plus ou n’est pas disponible.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {shop.cover_url || shop.photo_url ? (
            <Image source={{ uri: shop.cover_url ?? shop.photo_url ?? undefined }} style={styles.heroImage} />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroLetter}>{shop.name.charAt(0)}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.topBackButton} onPress={() => router.back()}>
            <ArrowLeft size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{shop.name}</Text>
          <Text style={styles.category}>{shop.category?.name_fr ?? 'Boutique'}</Text>

          <View style={styles.metaRow}>
            <MapPin size={16} color={Colors.text.secondary} />
            <Text style={styles.metaText}>{[shop.neighborhood, shop.address, shop.city?.name].filter(Boolean).join(', ') || 'Adresse non renseignée'}</Text>
          </View>

          <View style={styles.metaRow}>
            <Star size={16} color={Colors.primary} />
            <Text style={styles.metaText}>
              {shop.rating_count > 0 ? `${shop.rating_avg.toFixed(1)} (${shop.rating_count} avis)` : 'Pas encore d’avis'}
            </Text>
          </View>

          {shop.description ? <Text style={styles.description}>{shop.description}</Text> : null}

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCall} disabled={!shop.phone}>
              <Phone size={18} color={Colors.white} />
              <Text style={styles.actionText}>Appeler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.secondaryAction]} onPress={handleShare}>
              <Share2 size={18} color={Colors.primary} />
              <Text style={styles.secondaryActionText}>Partager</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Services</Text>
            <Text style={styles.cardText}>{shop.has_delivery ? 'Livraison disponible' : 'Retrait en boutique uniquement'}</Text>
            <Text style={styles.cardText}>{paymentMethods.length ? paymentMethods.join(' • ') : 'Aucun moyen de paiement mobile renseigné'}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Avis récents</Text>
            {reviewsLoading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : reviews.length > 0 ? (
              reviews.slice(0, 3).map((review) => (
                <View key={review.id} style={styles.reviewRow}>
                  <Text style={styles.reviewAuthor}>{review.user_profile?.full_name ?? 'Client'}</Text>
                  <Text style={styles.reviewRating}>{'★'.repeat(review.rating)}</Text>
                  {review.comment ? <Text style={styles.reviewComment}>{review.comment}</Text> : null}
                </View>
              ))
            ) : (
              <Text style={styles.cardText}>Aucun avis pour le moment.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background.secondary },
  content: { padding: Spacing.lg, gap: Spacing.md },
  hero: { height: 240, backgroundColor: Colors.primary, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroLetter: { fontSize: 72, fontWeight: '800', color: Colors.white },
  topBackButton: {
    position: 'absolute',
    top: Spacing.xl,
    left: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  backText: { color: Colors.text.primary, fontWeight: '600' },
  body: { padding: Spacing.lg, gap: Spacing.md },
  title: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.text.primary },
  subtitle: { fontSize: FontSizes.md, color: Colors.text.secondary, lineHeight: 22 },
  category: { color: Colors.primary, fontWeight: '700', fontSize: FontSizes.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaText: { flex: 1, color: Colors.text.secondary, fontSize: FontSizes.sm, lineHeight: 20 },
  description: { color: Colors.text.primary, fontSize: FontSizes.md, lineHeight: 22 },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  actionText: { color: Colors.white, fontWeight: '700' },
  secondaryAction: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border.light },
  secondaryActionText: { color: Colors.primary, fontWeight: '700' },
  card: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, gap: Spacing.sm, ...Shadows.sm },
  cardTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.text.primary },
  cardText: { color: Colors.text.secondary, fontSize: FontSizes.sm, lineHeight: 20 },
  reviewRow: { gap: 4, paddingVertical: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.border.light },
  reviewAuthor: { color: Colors.text.primary, fontWeight: '600', fontSize: FontSizes.sm },
  reviewRating: { color: Colors.primary, fontSize: FontSizes.sm },
  reviewComment: { color: Colors.text.secondary, fontSize: FontSizes.sm, lineHeight: 20 },
});