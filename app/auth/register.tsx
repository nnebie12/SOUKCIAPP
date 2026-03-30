import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Mail,
  Lock,
  User,
  Phone,
  Store,
  UserCircle,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

// ─── Types ────────────────────────────────────────────────────────

type AccountType = 'customer' | 'merchant';
type BusinessType = 'individual' | 'company';
type Step = 'account_type' | 'form';

// ─── AccountTypeCard ──────────────────────────────────────────────

function AccountTypeCard({
  type,
  selected,
  onSelect,
}: {
  type: AccountType;
  selected: boolean;
  onSelect: () => void;
}) {
  const isCustomer = type === 'customer';
  return (
    <TouchableOpacity
      style={[styles.typeCard, selected && styles.typeCardSelected]}
      onPress={onSelect}
      activeOpacity={0.85}>
      <View
        style={[
          styles.typeIcon,
          { backgroundColor: selected
              ? (isCustomer ? Colors.secondary : Colors.primary) + '22'
              : Colors.background.secondary },
        ]}>
        {isCustomer ? (
          <UserCircle
            size={32}
            color={selected ? Colors.secondary : Colors.text.secondary}
          />
        ) : (
          <Store
            size={32}
            color={selected ? Colors.primary : Colors.text.secondary}
          />
        )}
      </View>
      <Text style={[styles.typeTitle, selected && { color: isCustomer ? Colors.secondary : Colors.primary }]}>
        {isCustomer ? 'Client' : 'Commerçant'}
      </Text>
      <Text style={styles.typeDesc}>
        {isCustomer
          ? 'Découvrez et achetez dans les boutiques locales'
          : 'Créez votre boutique et vendez vos produits'}
      </Text>
      {selected && (
        <View
          style={[
            styles.typeCheckmark,
            { backgroundColor: isCustomer ? Colors.secondary : Colors.primary },
          ]}>
          <Text style={styles.typeCheckmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────

export default function RegisterScreen() {
  const { signUp } = useAuth();

  // Step
  const [step, setStep] = useState<Step>('account_type');
  const [accountType, setAccountType] = useState<AccountType>('customer');

  // Form fields
  const [fullName, setFullName]         = useState('');
  const [email, setEmail]               = useState('');
  const [phone, setPhone]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('individual');
  const [shopName, setShopName]         = useState('');

  // UI state
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const isMerchant = accountType === 'merchant';

  const validateForm = () => {
    if (!fullName.trim()) return 'Veuillez saisir votre nom complet';
    if (!email.trim())    return 'Veuillez saisir votre adresse email';
    if (!phone.trim())    return 'Veuillez saisir votre numéro de téléphone';
    if (password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères';
    if (password !== confirmPassword) return 'Les mots de passe ne correspondent pas';
    if (isMerchant && !shopName.trim()) return 'Veuillez saisir le nom de votre boutique';
    return null;
  };

  const handleRegister = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError('');
      setLoading(true);

      await signUp(email.trim(), password, fullName.trim(), phone.trim(), {
        is_merchant:   isMerchant,
        business_type: isMerchant ? businessType : null,
      });

      if (isMerchant) {
        router.replace('/shop/create-shop');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err.message ?? 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 1: Account type selection ────────────────────────────────
  if (step === 'account_type') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.logoRow}>
            <Text style={styles.logo}>SoukCI</Text>
          </View>

          <Text style={styles.stepTitle}>Bienvenue !</Text>
          <Text style={styles.stepSubtitle}>
            Quel type de compte souhaitez-vous créer ?
          </Text>

          <View style={styles.typeCards}>
            <AccountTypeCard
              type="customer"
              selected={accountType === 'customer'}
              onSelect={() => setAccountType('customer')}
            />
            <AccountTypeCard
              type="merchant"
              selected={accountType === 'merchant'}
              onSelect={() => setAccountType('merchant')}
            />
          </View>

          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => setStep('form')}>
            <Text style={styles.nextBtnText}>Continuer</Text>
            <ChevronRight size={20} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Déjà inscrit ? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── STEP 2: Form ─────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>

          {/* Back */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setStep('account_type')}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>

          <View style={styles.logoRow}>
            <Text style={styles.logo}>SoukCI</Text>
          </View>

          <Text style={styles.stepTitle}>
            {isMerchant ? 'Créer un compte commerçant' : 'Créer un compte'}
          </Text>
          <Text style={styles.stepSubtitle}>
            {isMerchant
              ? 'Renseignez vos informations pour créer votre boutique'
              : 'Rejoignez la communauté SoukCI'}
          </Text>

          {/* Erreur */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* ── Champs communs ── */}
          <View style={styles.form}>
            <View style={styles.inputRow}>
              <User size={18} color={Colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nom complet"
                placeholderTextColor={Colors.text.light}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            <View style={styles.inputRow}>
              <Mail size={18} color={Colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Adresse email"
                placeholderTextColor={Colors.text.light}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.inputRow}>
              <Phone size={18} color={Colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Téléphone (ex: +225 07 ...)"
                placeholderTextColor={Colors.text.light}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            <View style={styles.inputRow}>
              <Lock size={18} color={Colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Mot de passe (min. 6 caractères)"
                placeholderTextColor={Colors.text.light}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                {showPassword
                  ? <EyeOff size={18} color={Colors.text.secondary} />
                  : <Eye size={18} color={Colors.text.secondary} />}
              </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
              <Lock size={18} color={Colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor={Colors.text.light}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 4 }}>
                {showConfirmPassword
                  ? <EyeOff size={18} color={Colors.text.secondary} />
                  : <Eye size={18} color={Colors.text.secondary} />}
              </TouchableOpacity>
            </View>

            {/* ── Champs commerçant ── */}
            {isMerchant && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Informations boutique</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Type d'entreprise */}
                <Text style={styles.fieldLabel}>Type d'entreprise</Text>
                <View style={styles.businessTypeRow}>
                  <TouchableOpacity
                    style={[
                      styles.businessTypeBtn,
                      businessType === 'individual' && styles.businessTypeBtnActive,
                    ]}
                    onPress={() => setBusinessType('individual')}>
                    <UserCircle size={18} color={businessType === 'individual' ? Colors.primary : Colors.text.secondary} />
                    <Text style={[
                      styles.businessTypeBtnText,
                      businessType === 'individual' && { color: Colors.primary, fontWeight: '700' },
                    ]}>
                      Particulier
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.businessTypeBtn,
                      businessType === 'company' && styles.businessTypeBtnActive,
                    ]}
                    onPress={() => setBusinessType('company')}>
                    <Store size={18} color={businessType === 'company' ? Colors.primary : Colors.text.secondary} />
                    <Text style={[
                      styles.businessTypeBtnText,
                      businessType === 'company' && { color: Colors.primary, fontWeight: '700' },
                    ]}>
                      Entreprise
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Nom de la boutique */}
                <View style={styles.inputRow}>
                  <Store size={18} color={Colors.text.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nom de votre boutique *"
                    placeholderTextColor={Colors.text.light}
                    value={shopName}
                    onChangeText={setShopName}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>
              </>
            )}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.registerBtnText}>
                {isMerchant ? 'Créer mon compte commerçant' : "S'inscrire"}
              </Text>
            )}
          </TouchableOpacity>

          {/* CGU */}
          <Text style={styles.cgu}>
            En vous inscrivant, vous acceptez nos{' '}
            <Text style={styles.cguLink}>Conditions d'utilisation</Text>
            {' '}et notre{' '}
            <Text style={styles.cguLink}>Politique de confidentialité</Text>.
          </Text>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Déjà inscrit ? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll:    { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  logoRow:   { alignItems: 'center', marginVertical: Spacing.lg },
  logo:      { fontSize: FontSizes.xxxl, fontWeight: '800', color: Colors.primary },
  backBtn:   { marginBottom: Spacing.md },
  backBtnText: { fontSize: FontSizes.sm, color: Colors.text.secondary },
  stepTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },

  // Type cards
  typeCards: { gap: Spacing.md, marginBottom: Spacing.xl },
  typeCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border.light,
    ...Shadows.sm,
    position: 'relative',
  },
  typeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  typeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  typeTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  typeDesc: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  typeCheckmark: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeCheckmarkText: { color: Colors.white, fontWeight: '800', fontSize: 13 },

  // Form
  form: { gap: Spacing.sm, marginBottom: Spacing.lg },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    minHeight: 52,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  fieldLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 6,
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
    gap: Spacing.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border.light },
  dividerText: { fontSize: FontSizes.xs, color: Colors.text.secondary, fontWeight: '600' },

  // Business type
  businessTypeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  businessTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border.light,
    backgroundColor: Colors.white,
  },
  businessTypeBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  businessTypeBtnText: { fontSize: FontSizes.sm, color: Colors.text.secondary },

  // Error
  errorBox: {
    backgroundColor: Colors.status.error + '18',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.status.error,
  },
  errorText: { fontSize: FontSizes.sm, color: Colors.status.error },

  // Buttons
  nextBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  nextBtnText: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: '700' },
  registerBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  registerBtnDisabled: { opacity: 0.6 },
  registerBtnText: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: '700' },

  // Footer
  cgu: { fontSize: FontSizes.xs, color: Colors.text.light, textAlign: 'center', marginBottom: Spacing.lg, lineHeight: 18 },
  cguLink: { color: Colors.primary, fontWeight: '600' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontSize: FontSizes.sm, color: Colors.text.secondary },
  loginLink: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: '700' },
});
