import NetInfo from '@react-native-community/netinfo';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, FontSizes } from '@/constants/theme';
import { WifiOff, Wifi } from 'lucide-react-native';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [slideAnim]);

  const hide = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -60,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  useEffect(() => {
    const hideOnlineMessage = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        hide();
        setWasOffline(false);
      }, 3000);
    };

    const updateConnectionState = (connected: boolean) => {
      if (connected) {
        if (isOffline) {
          setWasOffline(true);
          hideOnlineMessage();
        }
        setIsOffline(false);
        return;
      }

      if (hideTimer.current) clearTimeout(hideTimer.current);
      setWasOffline(false);
      setIsOffline(true);
    };

    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = Boolean(state.isConnected) && state.isInternetReachable !== false;
      updateConnectionState(connected);
    });

    NetInfo.fetch().then((state) => {
      const connected = Boolean(state.isConnected) && state.isInternetReachable !== false;
      updateConnectionState(connected);
    });

    return () => {
      unsubscribe();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [hide, isOffline]);

  useEffect(() => {
    if (isOffline || wasOffline) {
      show();
    } else {
      hide();
    }
  }, [hide, isOffline, show, wasOffline]);

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
