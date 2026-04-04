import { Stack } from 'expo-router';

export default function LegalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Retour',
      }}>
      <Stack.Screen name="terms" options={{ title: 'Conditions d utilisation' }} />
      <Stack.Screen name="privacy" options={{ title: 'Confidentialite' }} />
      <Stack.Screen name="data-rights" options={{ title: 'Droits sur mes donnees' }} />
      <Stack.Screen name="delete-account" options={{ title: 'Suppression de compte' }} />
    </Stack>
  );
}
