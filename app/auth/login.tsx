import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message ?? 'Connexion impossible pour le moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={styles.brand}>SoukCI</Text>
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>Accédez à vos favoris, commandes et outils commerçants.</Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.inputRow}>
              <Mail size={18} color={Colors.text.secondary} style={styles.icon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Adresse email"
                placeholderTextColor={Colors.text.light}
                editable={!loading}
              />
            </View>

            <View style={styles.inputRow}>
              <Lock size={18} color={Colors.text.secondary} style={styles.icon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Mot de passe"
                placeholderTextColor={Colors.text.light}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword((value) => !value)} style={styles.eyeButton}>
                {showPassword ? <EyeOff size={18} color={Colors.text.secondary} /> : <Eye size={18} color={Colors.text.secondary} />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.primaryButtonText}>Se connecter</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/auth/register')}>
            <Text style={styles.secondaryButtonText}>Créer un compte</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl, justifyContent: 'center', flexGrow: 1 },
  hero: { marginBottom: Spacing.xl, gap: Spacing.xs },
  brand: { fontSize: FontSizes.xxxl, fontWeight: '800', color: Colors.primary },
  title: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.text.primary },
  subtitle: { fontSize: FontSizes.md, color: Colors.text.secondary, lineHeight: 22 },
  errorBox: {
    backgroundColor: '#FFF1F1',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#FFD0D0',
    marginBottom: Spacing.md,
  },
  errorText: { color: Colors.status.error, fontSize: FontSizes.sm },
  form: { gap: Spacing.sm, marginBottom: Spacing.lg },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    minHeight: 52,
    paddingHorizontal: Spacing.md,
    ...Shadows.sm,
  },
  icon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: FontSizes.md, color: Colors.text.primary },
  eyeButton: { padding: Spacing.xs },
  primaryButton: {
    minHeight: 52,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  primaryButtonText: { color: Colors.white, fontWeight: '700', fontSize: FontSizes.md },
  secondaryButton: {
    minHeight: 52,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { color: Colors.text.primary, fontWeight: '600', fontSize: FontSizes.md },
});