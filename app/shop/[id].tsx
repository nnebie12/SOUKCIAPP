import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Linking,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Shop, Review, Product, Promotion } from '@/types/database';
import { ArrowLeft, Star, MapPin, Phone, Mail, Heart, Share2, Clock, Truck, MessageCircle, CreditCard } from 'lucide-react-native';
import { PaymentModal } from '@/components/PaymentModal';

export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);

  useEffect(() => {
    loadShopData();
    incrementViewCount();
  }, [id]);

  const incrementViewCount = async () => {
    if (!id) return;
    try {
      await supabase.rpc('increment_view_count', { shop_id: id });
    } catch {
      // Fallback: manual increment
      try {
        const { data } = await supabase.from('shops').select('view_count').eq('id', id).maybeSingle();
        if (data) {
          await supabase.from('shops').update({ view_count: (data.view_count || 0) + 1 }).eq('id', id);
        }
      } catch {}
    }
  };

  const loadShopData = async () => {
    try {
      setLoading(true);
      const [shopRes, reviewsRes, productsRes, promotionsRes, favoriteRes] = await Promise.all([
        supabase.from('shops').select('*, category:categories(*), city:cities(*)').eq('id', id).maybeSingle(),
        supabase.from('reviews').select('*').eq('shop_id', id).order('created_at', { ascending: false }),
        supabase.from('products').select('*').eq('shop_id', id).eq('is_available', true).limit(10),
        supabase.from('promotions').select('*').eq('shop_id', id).eq('is_active', true).limit(5),
        user
          ? supabase.from('favorites').select('id').eq('user_id', user.id).eq('shop_id', id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (shopRes.data) setShop(shopRes.data);
      if (reviewsRes.data) setReviews(reviewsRes.data);
      if (productsRes.data) setProducts(productsRes.data);
      if (promotionsRes.data) setPromotions(promotionsRes.data);
      if (favoriteRes.data) setIsFavorite(true);
    } catch (error) {
      console.error('Error loading shop:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoritePress = async () => {
    if (!user) { router.push('/auth/login'); return; }
    try {
      if (isFavorite) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('shop_id', id);
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, shop_id: id });
      }
      setIsFavorite(!isFavorite);
    } catch (error) { console.error(error); }
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `Découvrez ${shop?.name} sur SoukCI!`, title: shop?.name, url: 'https://soukci.ci' });
    } catch {}
  };

  const handleWhatsApp = () => {
    if (shop?.whatsapp) {
      const phone = shop.whatsapp.replace(/\D/g, '');
      Linking.openURL(`whatsapp://send?phone=${phone}`);
    }
  };

  const handleCall = () => { if (shop?.phone) Linking.openURL(`tel:${shop.phone}`); };

  const acceptsAnyPayment = shop?.accepts_wave || shop?.accepts_orange_money || shop?.accepts_mtn_money;

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  if (!shop) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}><ArrowLeft size={24} color={Colors.text.primary} /></TouchableOpacity>
        <View style={styles.emptyState}><Text style={styles.emptyStateText}>Boutique non trouvée</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {shop.cover_url ? (
            <Image source={{ uri: shop.cover_url }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, styles.coverPlaceholder]} />
          )}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}><ArrowLeft size={24} color={Colors.white} /></TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleFavoritePress}>
            <Heart size={24} color={isFavorite ? Colors.status.error : Colors.white} fill={isFavorite ? Colors.status.error : 'transparent'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton2} onPress={handleShare}><Share2 size={24} color={Colors.white} /></TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.shopName}>{shop.name}</Text>
            {shop.is_premium && <View style={styles.premiumBadge}><Text style={styles.premiumText}>Premium</Text></View>}
          </View>

          {shop.category && <Text style={styles.category}>{shop.category.name_fr}</Text>}

          {shop.rating_count > 0 && (
            <View style={styles.ratingContainer}>
              <Star size={18} color={Colors.primary} fill={Colors.primary} />
              <Text style={styles.rating}>{shop.rating_avg.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({shop.rating_count} avis)</Text>
            </View>
          )}

          {/* Pay button */}
          {acceptsAnyPayment && (
            <TouchableOpacity style={styles.payButton} onPress={() => setPaymentVisible(true)}>
              <CreditCard size={20} color={Colors.white} />
              <Text style={styles.payButtonText}>Payer via Mobile Money</Text>
            </TouchableOpacity>
          )}

          {shop.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>À propos</Text>
              <Text style={styles.description}>{shop.description}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations</Text>
            {shop.neighborhood && (
              <View style={styles.infoRow}>
                <MapPin size={18} color={Colors.primary} />
                <Text style={styles.infoText}>{shop.neighborhood}, {shop.city?.name}</Text>
              </View>
            )}
            {shop.phone && (
              <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
                <Phone size={18} color={Colors.primary} />
                <Text style={styles.infoLink}>{shop.phone}</Text>
              </TouchableOpacity>
            )}
            {shop.email && (
              <View style={styles.infoRow}>
                <Mail size={18} color={Colors.primary} />
                <Text style={styles.infoText}>{shop.email}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.servicesGrid}>
              {shop.has_delivery && <View style={styles.serviceChip}><Truck size={16} color={Colors.primary} /><Text style={styles.serviceText}>Livraison</Text></View>}
              {shop.whatsapp && <TouchableOpacity style={styles.serviceChip} onPress={handleWhatsApp}><MessageCircle size={16} color={Colors.primary} /><Text style={styles.serviceText}>WhatsApp</Text></TouchableOpacity>}
              {shop.accepts_wave && <View style={[styles.serviceChip, { borderLeftColor: Colors.payment.wave, borderLeftWidth: 3 }]}><Text style={styles.serviceText}>Wave</Text></View>}
              {shop.accepts_orange_money && <View style={[styles.serviceChip, { borderLeftColor: Colors.payment.orangeMoney, borderLeftWidth: 3 }]}><Text style={styles.serviceText}>Orange Money</Text></View>}
              {shop.accepts_mtn_money && <View style={[styles.serviceChip, { borderLeftColor: Colors.payment.mtnMoney, borderLeftWidth: 3 }]}><Text style={styles.serviceText}>MTN Money</Text></View>}
            </View>
          </View>

          {promotions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Promotions</Text>
              {promotions.map((promo) => (
                <View key={promo.id} style={styles.promoCard}>
                  <Text style={styles.promoTitle}>{promo.title}</Text>
                  {promo.discount_percent && <Text style={styles.promoDiscount}>-{promo.discount_percent}%</Text>}
                  {promo.description && <Text style={styles.promoDescription}>{promo.description}</Text>}
                </View>
              ))}
            </View>
          )}

          {products.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Produits</Text>
              {products.slice(0, 5).map((product) => (
                <View key={product.id} style={styles.productCard}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>{product.price.toLocaleString('fr-CI')} FCFA</Text>
                </View>
              ))}
            </View>
          )}

          {reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Avis clients</Text>
              {reviews.slice(0, 5).map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewStars}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} color={i < review.rating ? Colors.primary : Colors.border.light} fill={i < review.rating ? Colors.primary : 'transparent'} />
                      ))}
                    </View>
                    <Text style={styles.reviewDate}>{new Date(review.created_at).toLocaleDateString('fr-CI')}</Text>
                  </View>
                  {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <PaymentModal
        visible={paymentVisible}
        onClose={() => setPaymentVisible(false)}
        shopName={shop.name}
        acceptsWave={shop.accepts_wave}
        acceptsOrangeMoney={shop.accepts_orange_money}
        acceptsMtnMoney={shop.accepts_mtn_money}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white },
  header: { position: 'relative', height: 300, marginBottom: Spacing.lg },
  cover: { width: '100%', height: '100%', resizeMode: 'cover' },
  coverPlaceholder: { backgroundColor: Colors.primary },
  backButton: { position: 'absolute', top: Spacing.lg, left: Spacing.lg, backgroundColor: 'rgba(0,0,0,0.3)', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  actionButton: { position: 'absolute', top: Spacing.lg, right: Spacing.lg, backgroundColor: 'rgba(0,0,0,0.3)', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  actionButton2: { position: 'absolute', top: Spacing.lg, right: 60, backgroundColor: 'rgba(0,0,0,0.3)', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  titleSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  shopName: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.text.primary, flex: 1 },
  premiumBadge: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.sm },
  premiumText: { color: Colors.white, fontSize: FontSizes.xs, fontWeight: '700' },
  category: { fontSize: FontSizes.md, color: Colors.primary, marginBottom: Spacing.md },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.sm },
  rating: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text.primary },
  ratingCount: { fontSize: FontSizes.sm, color: Colors.text.secondary },
  payButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.secondary, padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg, gap: Spacing.sm },
  payButtonText: { color: Colors.white, fontSize: FontSizes.md, fontWeight: '700' },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text.primary, marginBottom: Spacing.md },
  description: { fontSize: FontSizes.md, color: Colors.text.secondary, lineHeight: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.sm },
  infoText: { fontSize: FontSizes.md, color: Colors.text.primary, flex: 1 },
  infoLink: { fontSize: FontSizes.md, color: Colors.primary, fontWeight: '600', flex: 1 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  serviceChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background.secondary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.round, gap: Spacing.sm },
  serviceText: { fontSize: FontSizes.sm, color: Colors.text.primary, fontWeight: '600' },
  promoCard: { backgroundColor: Colors.primary + '10', borderLeftWidth: 4, borderLeftColor: Colors.primary, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  promoTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.text.primary, marginBottom: Spacing.xs },
  promoDiscount: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.primary, marginBottom: Spacing.xs },
  promoDescription: { fontSize: FontSizes.sm, color: Colors.text.secondary },
  productCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border.light },
  productName: { fontSize: FontSizes.md, color: Colors.text.primary, fontWeight: '600', flex: 1 },
  productPrice: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.primary },
  reviewCard: { backgroundColor: Colors.background.secondary, padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewDate: { fontSize: FontSizes.xs, color: Colors.text.secondary },
  reviewComment: { fontSize: FontSizes.sm, color: Colors.text.primary, lineHeight: 20 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyStateText: { fontSize: FontSizes.lg, color: Colors.text.secondary },
});
