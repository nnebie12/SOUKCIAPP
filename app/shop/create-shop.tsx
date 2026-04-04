import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Check, MapPin, Phone, Store } from 'lucide-react-native';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Category, City } from '@/types/database';
import { MOCK_CATEGORIES, MOCK_CITIES } from '@/data/mockData';

export default function CreateShopScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [cities, setCities] = useState<City[]>(MOCK_CITIES);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [categoryId, setCategoryId] = useState<string>(MOCK_CATEGORIES[0]?.id ?? '');
  const [cityId, setCityId] = useState<string>(MOCK_CITIES[0]?.id ?? '');
  const [hasDelivery, setHasDelivery] = useState(false);
  const [acceptsWave, setAcceptsWave] = useState(true);
  const [acceptsOrangeMoney, setAcceptsOrangeMoney] = useState(false);
  const [acceptsMtnMoney, setAcceptsMtnMoney] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
      return;
    }

    const bootstrap = async () => {
      try {
        const [categoriesRes, citiesRes, existingShopRes] = await Promise.all([
          supabase.from('categories').select('*').order('name_fr'),
          supabase.from('cities').select('*').order('name'),
          supabase.from('shops').select('id').eq('owner_id', user.id).maybeSingle(),
        ]);

        if (existingShopRes.data?.id) {
          router.replace('/shop/merchant');
          return;
        }

        if (categoriesRes.data?.length) {
          setCategories(categoriesRes.data as Category[]);
          setCategoryId(categoriesRes.data[0].id);
        }
        if (citiesRes.data?.length) {
          setCities(citiesRes.data as City[]);
          setCityId(citiesRes.data[0].id);
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [user]);

  const selectedCity = useMemo(() => cities.find((city) => city.id === cityId) ?? null, [cities, cityId]);

  const handleCreateShop = async () => {
    if (!user) return;
    if (!name.trim() || !categoryId || !cityId) {
      Alert.alert('Champs requis', 'Nom, catégorie et ville sont obligatoires.');
      return;
    }

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('shops')
        .insert({
          owner_id: user.id,
          name: name.trim(),
          description: description.trim() || null,
          category_id: categoryId,
          city_id: cityId,
          address: address.trim() || null,
          neighborhood: neighborhood.trim() || null,
          latitude: selectedCity?.latitude ?? null,
          longitude: selectedCity?.longitude ?? null,
          phone: phone.trim() || profile?.phone || null,
          whatsapp: phone.trim() || profile?.phone || null,
          email: user.email ?? null,
          photo_url: null,
          cover_url: null,
          has_delivery: hasDelivery,
          accepts_wave: acceptsWave,
          accepts_orange_money: acceptsOrangeMoney,
          accepts_mtn_money: acceptsMtnMoney,
          rating_avg: 0,
          rating_count: 0,
          view_count: 0,
          click_count: 0,
          is_verified: false,
          is_premium: false,
          is_active: true,
        })
        .select('id')
        .single();

      if (error) throw error;

      if (!profile?.is_merchant) {
        await supabase.from('user_profiles').update({ is_merchant: true }).eq('id', user.id);
        await refreshProfile();
      }

      router.replace({ pathname: '/shop/[id]', params: { id: data.id } });
    } catch (err: any) {
      Alert.alert('Création impossible', err.message ?? 'La boutique n’a pas pu être créée.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color={Colors.text.primary} />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Créer ma boutique</Text>
        <Text style={styles.subtitle}>Complétez les informations minimales pour publier votre vitrine.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations principales</Text>
          <Input icon={<Store size={18} color={Colors.text.secondary} />} value={name} onChangeText={setName} placeholder="Nom de la boutique" />
          <Input icon={<Phone size={18} color={Colors.text.secondary} />} value={phone} onChangeText={setPhone} placeholder="Téléphone / WhatsApp" keyboardType="phone-pad" />
          <Input icon={<MapPin size={18} color={Colors.text.secondary} />} value={address} onChangeText={setAddress} placeholder="Adresse" />
          <Input value={neighborhood} onChangeText={setNeighborhood} placeholder="Quartier" />
          <Input value={description} onChangeText={setDescription} placeholder="Description" multiline />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégorie</Text>
          <ChipList items={categories.map((category) => ({ id: category.id, label: category.name_fr }))} selectedId={categoryId} onSelect={setCategoryId} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ville</Text>
          <ChipList items={cities.map((city) => ({ id: city.id, label: city.name }))} selectedId={cityId} onSelect={setCityId} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <ToggleRow label="Livraison disponible" value={hasDelivery} onValueChange={setHasDelivery} />
          <ToggleRow label="Wave" value={acceptsWave} onValueChange={setAcceptsWave} />
          <ToggleRow label="Orange Money" value={acceptsOrangeMoney} onValueChange={setAcceptsOrangeMoney} />
          <ToggleRow label="MTN Money" value={acceptsMtnMoney} onValueChange={setAcceptsMtnMoney} />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleCreateShop} disabled={saving}>
          {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.primaryButtonText}>Créer la boutique</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Input({
  icon,
  multiline = false,
  ...props
}: {
  icon?: React.ReactNode;
  multiline?: boolean;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad';
}) {
  return (
    <View style={[styles.inputRow, multiline && styles.inputRowMultiline]}>
      {icon ? <View style={styles.inputIcon}>{icon}</View> : null}
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        placeholderTextColor={Colors.text.light}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...props}
      />
    </View>
  );
}

function ChipList({
  items,
  selectedId,
  onSelect,
}: {
  items: Array<{ id: string; label: string }>;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={styles.chipList}>
      {items.map((item) => {
        const active = item.id === selectedId;
        return (
          <TouchableOpacity key={item.id} style={[styles.chip, active && styles.chipActive]} onPress={() => onSelect(item.id)}>
            {active ? <Check size={14} color={Colors.white} /> : null}
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: Colors.border.light, true: Colors.primary }} thumbColor={Colors.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.secondary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background.secondary },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.lg },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  backText: { color: Colors.text.primary, fontSize: FontSizes.sm, fontWeight: '600' },
  title: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.text.primary },
  subtitle: { fontSize: FontSizes.md, color: Colors.text.secondary, lineHeight: 22 },
  section: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, gap: Spacing.sm, ...Shadows.sm },
  sectionTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.text.primary, marginBottom: Spacing.xs },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background.secondary,
    minHeight: 52,
    paddingHorizontal: Spacing.md,
  },
  inputRowMultiline: { minHeight: 120, alignItems: 'flex-start', paddingVertical: Spacing.md },
  inputIcon: { marginRight: Spacing.sm, marginTop: 2 },
  input: { flex: 1, fontSize: FontSizes.md, color: Colors.text.primary },
  multilineInput: { minHeight: 88 },
  chipList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.background.secondary,
  },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { color: Colors.text.primary, fontSize: FontSizes.sm, fontWeight: '600' },
  chipTextActive: { color: Colors.white },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  toggleLabel: { color: Colors.text.primary, fontSize: FontSizes.md, fontWeight: '500' },
  primaryButton: {
    minHeight: 54,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: Colors.white, fontSize: FontSizes.md, fontWeight: '700' },
});