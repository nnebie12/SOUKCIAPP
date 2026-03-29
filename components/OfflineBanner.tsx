import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Colors, Spacing, FontSizes } from '@/constants/theme';
import { WifiOff, Wifi } from 'lucide-react-native';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleOnline = () => {
        setWasOffline(true);
        setIsOffline(false);
        // Show "back online" briefly then hide
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => {
          hide();
          setWasOffline(false);
        }, 3000);
      };
      const handleOffline = () => {
        setIsOffline(true);
        setWasOffline(false);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      setIsOffline(!navigator.onLine);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        if (hideTimer.current) clearTimeout(hideTimer.current);
      };
    }
  }, []);

  const show = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const hide = () => {
    Animated.timing(slideAnim, {
      toValue: -60,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (isOffline || wasOffline) {
      show();
    } else {
      hide();
    }
  }, [isOffline, wasOffline]);

  if (!isOffline && !wasOffline) return null;

  return (
    <Animated.View
      style={[
        styles.banner,
        wasOffline && !isOffline ? styles.onlineBanner : styles.offlineBanner,
        { transform: [{ translateY: slideAnim }] },
      ]}>
      {wasOffline && !isOffline ? (
        <Wifi size={16} color={Colors.white} />
      ) : (
        <WifiOff size={16} color={Colors.white} />
      )}
      <Text style={styles.text}>
        {wasOffline && !isOffline ? 'Connexion rétablie' : 'Mode hors-ligne — Vérifiez votre connexion'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    zIndex: 9999,
  },
  offlineBanner: {
    backgroundColor: Colors.status.error,
  },
  onlineBanner: {
    backgroundColor: Colors.status.success,
  },
  text: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});
