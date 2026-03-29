import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🛍️',
    title: 'Bienvenue sur SoukCI',
    subtitle: 'Découvrez les meilleures boutiques de Côte d\'Ivoire, près de chez vous.',
    gradient: [Colors.primary, Colors.primaryDark] as [string, string],
  },
  {
    id: '2',
    emoji: '🗺️',
    title: 'Explorez par carte',
    subtitle: 'Trouvez les boutiques autour de vous grâce à la géolocalisation en temps réel.',
    gradient: [Colors.secondary, Colors.secondaryDark] as [string, string],
  },
  {
    id: '3',
    emoji: '📱',
    title: 'Payez facilement',
    subtitle: 'Wave, Orange Money, MTN Money — réglez vos achats directement depuis l\'app.',
    gradient: ['#6C63FF', '#4B44CC'] as [string, string],
  },
  {
    id: '4',
    emoji: '⭐',
    title: 'Trouvez les meilleures offres',
    subtitle: 'Promotions actives, boutiques vérifiées et avis clients pour acheter en confiance.',
    gradient: [Colors.status.warning, '#E69500'] as [string, string],
  },
];

const ONBOARDING_KEY = 'soukci_onboarding_done';

export function markOnboardingDone() {
  if (Platform.OS === 'web') {
    try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch {}
  }
}

export function hasSeenOnboarding(): boolean {
  if (Platform.OS === 'web') {
    try { return localStorage.getItem(ONBOARDING_KEY) === '1'; } catch {}
  }
  return false;
}

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    markOnboardingDone();
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    handleFinish();
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <LinearGradient colors={item.gradient} style={styles.slide}>
            <View style={styles.slideContent}>
              <Text style={styles.slideEmoji}>{item.emoji}</Text>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
            </View>
          </LinearGradient>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttonsRow}>
        {currentIndex < SLIDES.length - 1 ? (
          <>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Passer</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextText}>Suivant →</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={handleFinish} style={styles.startButton}>
            <Text style={styles.startText}>Commencer 🎉</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  slide: {
    width,
    height: height * 0.78,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  slideEmoji: {
    fontSize: 80,
    marginBottom: Spacing.xl,
  },
  slideTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  slideSubtitle: {
    fontSize: FontSizes.lg,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 28,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border.medium,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  skipButton: {
    padding: Spacing.md,
  },
  skipText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
  },
  nextText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  startButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
  },
  startText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
});
