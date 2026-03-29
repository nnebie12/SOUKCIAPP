import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Switch,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Category, City } from '@/types/database';
import { ArrowLeft } from 'lucide-react-native';

export default function CreateShopScreen() {
  const { user, refreshProfile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    cityId: '',
    address: '',
    neighborhood: '',
    phone: '',
    whatsapp: '',
    email: '',
    hasDelivery: false,
    acceptsWave: false,
    acceptsOrangeMoney: false,
    acceptsMtnMoney: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, citiesRes] = await Promise.all([
        supabase.from('categories').select('*').order('name_fr'),
        supabase.from('cities').select('*').order('name'),
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (citiesRes.data) setCities(citiesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreateShop = async () => {
    if (!user || !formData.name || !formData.categoryId || !formData.cityId) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('shops')
        .insert({
          owner_id: user.id,
          name: formData.name,
          description: formData.description,
          category_id: formData.categoryId,
          city_id: formData.cityId,
          address: formData.address,
          neighborhood: formData.neighborhood,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          email: formData.email,
          has_delivery: formData.hasDelivery,
          accepts_wave: formData.acceptsWave,
          accepts_orange_money: formData.acceptsOrangeMoney,
          accepts_mtn_money: formData.acceptsMtnMoney,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('user_profiles')
        .update({ is_merchant: true })
        .eq('id', user.id);

      await refreshProfile();
      router.replace('/shop/merchant');
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la création de la boutique');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Créer ma boutique</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations principales</Text>

            <View>
              <Text style={styles.label}>Nom de la boutique *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Magasin de tissu Adou"
                placeholderTextColor={Colors.text.secondary}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, name: text }))
                }
                editable={!loading}
              />
            </View>

            <View>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Décrivez votre boutique..."
                placeholderTextColor={Colors.text.secondary}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, description: text }))
                }
                multiline
                editable={!loading}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.col, styles.colHalf]}>
                <Text style={styles.label}>Catégorie *</Text>
                <ScrollView style={styles.selectScroll}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.selectOption,
                        formData.categoryId === cat.id &&
                          styles.selectOptionActive,
                      ]}
                      onPress={() =>
                        setFormData((prev) => ({
                          ...prev,
                          categoryId: cat.id,
                        }))
                      }>
                      <Text
                        style={[
                          styles.selectOptionText,
                          formData.categoryId === cat.id &&
                            styles.selectOptionTextActive,
                        ]}>
                        {cat.name_fr}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={[styles.col, styles.colHalf]}>
                <Text style={styles.label}>Ville *</Text>
                <ScrollView style={styles.selectScroll}>
                  {cities.map((city) => (
                    <TouchableOpacity
                      key={city.id}
                      style={[
                        styles.selectOption,
                        formData.cityId === city.id && styles.selectOptionActive,
                      ]}
                      onPress={() =>
                        setFormData((prev) => ({ ...prev, cityId: city.id }))
                      }>
                      <Text
                        style={[
                          styles.selectOptionText,
                          formData.cityId === city.id &&
                            styles.selectOptionTextActive,
                        ]}>
                        {city.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localisation</Text>

            <View>
              <Text style={styles.label}>Adresse</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Rue de la Paix, Abidjan"
                placeholderTextColor={Colors.text.secondary}
                value={formData.address}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, address: text }))
                }
                editable={!loading}
              />
            </View>

            <View>
              <Text style={styles.label}>Quartier</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Plateau"
                placeholderTextColor={Colors.text.secondary}
                value={formData.neighborhood}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, neighborhood: text }))
                }
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>

            <View>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: +225 22 12 34 56"
                placeholderTextColor={Colors.text.secondary}
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, phone: text }))
                }
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            <View>
              <Text style={styles.label}>WhatsApp</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: +225 01 23 45 67"
                placeholderTextColor={Colors.text.secondary}
                value={formData.whatsapp}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, whatsapp: text }))
                }
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            <View>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: contact@boutique.ci"
                placeholderTextColor={Colors.text.secondary}
                value={formData.email}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, email: text }))
                }
                keyboardType="email-address"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services et paiements</Text>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Livraison disponible</Text>
              <Switch
                value={formData.hasDelivery}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, hasDelivery: value }))
                }
                trackColor={{ false: Colors.border.light, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Accepte Wave</Text>
              <Switch
                value={formData.acceptsWave}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, acceptsWave: value }))
                }
                trackColor={{ false: Colors.border.light, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Accepte Orange Money</Text>
              <Switch
                value={formData.acceptsOrangeMoney}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    acceptsOrangeMoney: value,
                  }))
                }
                trackColor={{ false: Colors.border.light, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Accepte MTN Money</Text>
              <Switch
                value={formData.acceptsMtnMoney}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, acceptsMtnMoney: value }))
                }
                trackColor={{ false: Colors.border.light, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.createButton, loading && styles.buttonDisabled]}
            onPress={handleCreateShop}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.createButtonText}>Créer ma boutique</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  col: {
    flex: 1,
  },
  colHalf: {
    flex: 0.5,
  },
  selectScroll: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    maxHeight: 120,
  },
  selectOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  selectOptionActive: {
    backgroundColor: Colors.primary,
  },
  selectOptionText: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
  },
  selectOptionTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  switchLabel: {
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
});
