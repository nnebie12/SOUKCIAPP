import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { ChevronRight, FileText, Heart, LogOut, Phone, PlusCircle, Settings, Shield, Store, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface MerchantStats {
  shopName: string;
  shopId: string;
  viewCount: number;
  ratingAvg: number;
  ratingCount: number;
  favoriteCount: number;
}

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [merchantStats, setMerchantStats] = useState<MerchantStats | null>(null);

  useEffect(() => {
    if (user && profile?.is_merchant) {
      loadMerchantStats();
    }
  }, [user, profile]);

  const loadMerchantStats = async () => {
    if (!user) return;
    try {
      const { data: shop } = await supabase
        .from('shops')
        .select('id, name, view_count, rating_avg, rating_count')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (shop) {
        const { count } = await supabase
          .from('favorites')
          .select('id', { count: 'exact', head: true })
          .eq('shop_id', shop.id);

        setMerchantStats({
          shopId: shop.id,
          shopName: shop.name,
          viewCount: shop.view_count || 0,
          ratingAvg: shop.rating_avg || 0,
          ratingCount: shop.rating_count || 0,
          favoriteCount: count || 0,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}><Text style={styles.emptyIconText}>👤</Text></View>
          <Text style={styles.emptyStateTitle}>Connectez-vous</Text>
          <Text style={styles.emptyStateText}>
            Créez un compte pour accéder à vos favoris et gérer votre boutique
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerButtonText}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Text style={styles.headerTitle}>Mon Profil</Text></View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.name}>{profile?.full_name || 'Utilisateur'}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {profile?.phone && (
            <View style={styles.infoRow}>
              <Phone size={14} color={Colors.text.secondary} />
              <Text style={styles.infoText}>{profile.phone}</Text>
            </View>
          )}
          {profile?.is_merchant && (
            <View style={styles.merchantBadge}>
              <Store size={13} color={Colors.white} />
              <Text style={styles.merchantBadgeText}>Commerçant</Text>
            </View>
          )}
        </View>

        {/* Merchant stats */}
        {merchantStats && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Ma boutique — {merchantStats.shopName}</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{merchantStats.viewCount.toLocaleString('fr')}</Text>
                <Text style={styles.statLabel}>Vues</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{merchantStats.ratingAvg > 0 ? merchantStats.ratingAvg.toFixed(1) : '—'}</Text>
                <Text style={styles.statLabel}>Note moy.</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{merchantStats.ratingCount}</Text>
                <Text style={styles.statLabel}>Avis</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{merchantStats.favoriteCount}</Text>
                <Text style={styles.statLabel}>Favoris</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.manageShopBtn}
              onPress={() => router.push({ pathname: '/shop/[id]', params: { id: merchantStats.shopId } })}>
              <Text style={styles.manageShopBtnText}>Voir ma boutique</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Options</Text>

          {profile?.is_merchant ? (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/shop/merchant')}>
              <View style={styles.menuIcon}><Store size={20} color={Colors.primary} /></View>
              <Text style={styles.menuItemText}>Gérer ma boutique</Text>
              <ChevronRight size={18} color={Colors.text.secondary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/shop/create-shop')}>
              <View style={styles.menuIcon}><PlusCircle size={20} color={Colors.secondary} /></View>
              <Text style={styles.menuItemText}>Créer une boutique</Text>
              <ChevronRight size={18} color={Colors.text.secondary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/favorites')}>
            <View style={styles.menuIcon}><Heart size={20} color={Colors.status.error} /></View>
            <Text style={styles.menuItemText}>Mes favoris</Text>
            <ChevronRight size={18} color={Colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}><Settings size={20} color={Colors.text.secondary} /></View>
            <Text style={styles.menuItemText}>Paramètres</Text>
            <ChevronRight size={18} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Data protection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Protection des données</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/legal/privacy')}>
            <View style={styles.menuIcon}><Shield size={20} color={Colors.status.info} /></View>
            <Text style={styles.menuItemText}>Politique de confidentialité</Text>
            <ChevronRight size={18} color={Colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/legal/data-rights')}>
            <View style={styles.menuIcon}><FileText size={20} color={Colors.primary} /></View>
            <Text style={styles.menuItemText}>Mes droits sur mes données</Text>
            <ChevronRight size={18} color={Colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/legal/delete-account')}>
            <View style={styles.menuIcon}><Trash2 size={20} color={Colors.status.error} /></View>
            <Text style={styles.menuItemText}>Suppression de compte</Text>
            <ChevronRight size={18} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>SoukCI v1.0.0</Text>
            <Text style={styles.aboutText}>La plateforme qui réunit les boutiques de Côte d'Ivoire</Text>
            <View style={styles.aboutLinks}>
              <TouchableOpacity onPress={() => router.push('/legal/privacy')}>
                <Text style={styles.aboutLink}>Confidentialité</Text>
              </TouchableOpacity>
              <Text style={styles.dot}>•</Text>
              <TouchableOpacity onPress={() => router.push('/legal/data-rights')}>
                <Text style={styles.aboutLink}>Droits utilisateur</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <LogOut size={20} color={Colors.white} />
              <Text style={styles.signOutButtonText}>Se déconnecter</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.text.primary },
  profileCard: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.xl,
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, alignItems: 'center', ...Shadows.md,
  },
  avatarContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: Colors.white },
  name: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.text.primary, marginBottom: Spacing.xs },
  email: { fontSize: FontSizes.sm, color: Colors.text.secondary, marginBottom: Spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  infoText: { fontSize: FontSizes.sm, color: Colors.text.primary },
  merchantBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.secondary, paddingHorizontal: Spacing.md,
    paddingVertical: 4, borderRadius: BorderRadius.round, marginTop: Spacing.sm,
  },
  merchantBadgeText: { color: Colors.white, fontSize: FontSizes.xs, fontWeight: '700' },
  statsSection: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  statsGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.md, alignItems: 'center', ...Shadows.sm,
  },
  statValue: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: FontSizes.xs, color: Colors.text.secondary, marginTop: 2 },
  manageShopBtn: {
    backgroundColor: Colors.primary, padding: Spacing.md,
    borderRadius: BorderRadius.lg, alignItems: 'center',
  },
  manageShopBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSizes.md },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text.primary, marginBottom: Spacing.md },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, ...Shadows.sm,
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.background.secondary, justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuItemText: { flex: 1, fontSize: FontSizes.md, color: Colors.text.primary, fontWeight: '600' },
  aboutCard: { backgroundColor: Colors.white, padding: Spacing.lg, borderRadius: BorderRadius.lg, ...Shadows.sm },
  aboutTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.text.primary, marginBottom: Spacing.xs },
  aboutText: { fontSize: FontSizes.sm, color: Colors.text.secondary, marginBottom: Spacing.md },
  aboutLinks: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  aboutLink: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: '600' },
  dot: { color: Colors.text.secondary },
  signOutButton: {
    flexDirection: 'row', marginHorizontal: Spacing.lg, marginVertical: Spacing.xl,
    backgroundColor: Colors.status.error, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm,
  },
  signOutButtonText: { color: Colors.white, fontSize: FontSizes.md, fontWeight: '600' },
  emptyState: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.background.tertiary,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg,
  },
  emptyIconText: { fontSize: 36 },
  emptyStateTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.text.primary, marginBottom: Spacing.sm },
  emptyStateText: { fontSize: FontSizes.md, color: Colors.text.secondary, textAlign: 'center', marginBottom: Spacing.xl },
  loginButton: {
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md, width: '100%', alignItems: 'center',
  },
  loginButtonText: { color: Colors.white, fontSize: FontSizes.md, fontWeight: '600' },
  registerButton: {
    backgroundColor: Colors.white, paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
    borderWidth: 2, borderColor: Colors.primary, width: '100%', alignItems: 'center',
  },
  registerButtonText: { color: Colors.primary, fontSize: FontSizes.md, fontWeight: '600' },
});
