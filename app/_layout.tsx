import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { OfflineBanner } from '@/components/OfflineBanner';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <View style={styles.root}>
        <OfflineBanner />

        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" /> {/* 👈 important */}
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="shop" />
          <Stack.Screen name="+not-found" />
        </Stack>

        <StatusBar style="auto" />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});