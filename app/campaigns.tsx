import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import {
  ArrowLeft,
  Megaphone,
  Plus,
  TrendingUp,
  Eye,
  MousePointer,
  X,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { CampaignPlanCard } from '@/components/CampaignPlanCard';
import { Campaign, CampaignPlan, CampaignStatus } from '@/types/database';
import { MOCK_CAMPAIGN_PLANS } from '@/data/mockData';

// ─── Status config ────────────────────────────────────────────────

const STATUS_CONFIG: Record<CampaignStatus, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Brouillon',  color: Colors.text.secondary, bg: Colors.border.light },
  active:    { label: 'Active',     color: Colors.status.success, bg: Colors.status.success + '18' },
  paused:    { label: 'En pause',   color: Colors.status.warning, bg: Colors.status.warning + '18' },
  completed: { label: 'Terminée',   color: Colors.status.info,   bg: Colors.status.info + '18' },
  cancelled: { label: 'Annulée',    color: Colors.status.error,  bg: Colors.status.error + '18' },
};

// ─── CampaignRow ──────────────────────────────────────────────────

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const cfg = STATUS_CONFIG[campaign.status];
  const ctr = campaign.impressions > 0
    ? ((campaign.clicks / campaign.impressions) * 100).toFixed(1)
    : '0.0';

  return (
    <View style={styles.campaignRow}>
      <View style={styles.campaignRowHeader}>
        <Text style={styles.campaignTitle} numberOfLines={1}>
          {campaign.title}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>
      <Text style={styles.campaignPlan}>
        Forfait {campaign.plan?.label_fr ?? '—'}
      </Text>
      <View style={styles.campaignStats}>
        <View style={styles.campaignStat}>
          <Eye size={12} color={Colors.text.light} />
          <Text style={styles.campaignStatValue}>
            {campaign.impressions.toLocaleString('fr-CI')}
          </Text>
          <Text style={styles.campaignStatLabel}>impressions</Text>
        </View>
        <View style={styles.campaignStat}>
          <MousePointer size={12} color={Colors.text.light} />
          <Text style={styles.campaignStatValue}>{campaign.clicks}</Text>
          <Text style={styles.campaignStatLabel}>clics</Text>
        </View>
        <View style={styles.campaignStat}>
          <TrendingUp size={12} color={Colors.text.light} />
          <Text style={styles.campaignStatValue}>{ctr}%</Text>
          <Text style={styles.campaignStatLabel}>CTR</Text>
        </View>
      </View>
    </View>
  );
}

// ─── CreateCampaignModal ──────────────────────────────────────────

interface CreateCampaignModalProps {
  visible: boolean;
  onClose: () => void;
  shopId: string;
  plans: CampaignPlan[];
  onCreated: () => void;
}

function CreateCampaignModal({
  visible,
  onClose,
  shopId,
  plans,
  onCreated,
}: CreateCampaignModalProps) {
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<CampaignPlan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Titre requis', 'Veuillez saisir un titre pour votre campagne.');
      return;
    }
    if (!selectedPlan) {
      Alert.alert('Forfait requis', 'Veuillez choisir un forfait.');
      return;
    }

    try {
      setSubmitting(true);
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + selectedPlan.duration_days);

      const { error } = await supabase.from('campaigns').insert({
        shop_id:     shopId,
        plan_id:     selectedPlan.id,
        title:       title.trim(),
        description: description.trim() || null,
        status:      'draft',
        ends_at:     endsAt.toISOString(),
      });

      if (error) throw error;

      Alert.alert(
        'Campagne créée ! 🎉',
        `Votre campagne "${title}" a été créée. Procédez au paiement pour l'activer.`
      );
      setTitle('');
      setDescription('');
      setSelectedPlan(null);
      onCreated();
      onClose();
    } catch (err: any) {
      Alert.alert('Erreur', err.message ?? 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={() => {}}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nouvelle campagne</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={22} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Titre */}
            <Text style={styles.fieldLabel}>Titre de la campagne *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Soldes de printemps"
              placeholderTextColor={Colors.text.light}
              value={title}
              onChangeText={setTitle}
            />

            {/* Description */}
            <Text style={styles.fieldLabel}>Description (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Décrivez votre campagne..."
              placeholderTextColor={Colors.text.light}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {/* Forfaits */}
            <Text style={styles.fieldLabel}>Choisir un forfait *</Text>
            {plans.map((plan) => (
              <CampaignPlanCard
                key={plan.id}
                plan={plan}
                selected={selectedPlan?.id === plan.id}
                onSelect={setSelectedPlan}
              />
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
            onPress={handleCreate}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitBtnText}>Créer la campagne</Text>
            )}
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────

export default function CampaignsScreen() {
  const { user, profile } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [plans, setPlans]         = useState<CampaignPlan[]>(MOCK_CAMPAIGN_PLANS);
  const [shopId, setShopId]       = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);

      // Récupérer la boutique du commerçant
      const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (shop) {
        setShopId(shop.id);

        const { data: cams } = await supabase
          .from('campaigns')
          .select('*, plan:campaign_plans(*)')
          .eq('shop_id', shop.id)
          .order('created_at', { ascending: false });

        setCampaigns((cams as Campaign[]) ?? []);
      }

      // Charger les plans depuis Supabase (fallback sur mockData)
      const { data: dbPlans } = await supabase
        .from('campaign_plans')
        .select('*')
        .order('price_fcfa', { ascending: true });

      if (dbPlans && dbPlans.length > 0) {
        setPlans(dbPlans as CampaignPlan[]);
      }
    } catch (err) {
      console.error('[CampaignsScreen]', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!profile?.is_merchant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Campagnes</Text>
        </View>
        <View style={styles.emptyState}>
          <Megaphone size={56} color={Colors.border.medium} />
          <Text style={styles.emptyTitle}>Réservé aux commerçants</Text>
          <Text style={styles.emptySubtitle}>
            Créez d'abord une boutique pour accéder aux campagnes publicitaires.
          </Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push('/shop/create-shop')}>
            <Text style={styles.ctaBtnText}>Créer ma boutique</Text>
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
        <Text style={styles.headerTitle}>Mes campagnes</Text>
        {shopId && (
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => setShowCreate(true)}>
            <Plus size={18} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>

          {/* Aucune boutique */}
          {!shopId && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Vous devez d'abord créer une boutique pour lancer des campagnes.
              </Text>
              <TouchableOpacity onPress={() => router.push('/shop/create-shop')}>
                <Text style={styles.infoLink}>Créer ma boutique →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Campagnes existantes */}
          {campaigns.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mes campagnes</Text>
              {campaigns.map((c) => (
                <CampaignRow key={c.id} campaign={c} />
              ))}
            </View>
          )}

          {/* Plans disponibles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Forfaits disponibles</Text>
            <Text style={styles.sectionSubtitle}>
              Boostez la visibilité de votre boutique sur SoukCI
            </Text>
            {plans.map((plan) => (
              <CampaignPlanCard
                key={plan.id}
                plan={plan}
                onSelect={() => {
                  if (shopId) setShowCreate(true);
                  else Alert.alert('Boutique requise', 'Créez d\'abord une boutique.');
                }}
              />
            ))}
          </View>
        </ScrollView>
      )}

      {/* Modal création */}
      {shopId && (
        <CreateCampaignModal
          visible={showCreate}
          onClose={() => setShowCreate(false)}
          shopId={shopId}
          plans={plans}
          onCreated={fetchData}
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
    flex: 1,
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  newBtn: {
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  infoBox: {
    backgroundColor: Colors.primary + '12',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  infoLink: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '700',
  },

  // CampaignRow
  campaignRow: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  campaignRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  campaignTitle: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text.primary,
    marginRight: Spacing.sm,
  },
  campaignPlan: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  campaignStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  campaignStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  campaignStatValue: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  campaignStatLabel: {
    fontSize: FontSizes.xs,
    color: Colors.text.light,
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

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  fieldLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  submitBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSizes.md,
  },

  // Empty state
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
  ctaBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  ctaBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSizes.md,
  },
});
