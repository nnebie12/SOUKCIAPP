import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

interface UseLocationResult {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (Platform.OS === 'web') {
      if (!navigator.geolocation) {
        setError('Géolocalisation non supportée');
        // Fallback: Abidjan
        setLocation({ lat: 5.3599517, lng: -4.0082563 });
        setLoading(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
          setLoading(false);
        },
        () => {
          setLocation({ lat: 5.3599517, lng: -4.0082563 });
          setLoading(false);
        },
        { timeout: 8000, enableHighAccuracy: false }
      );
    } else {
      try {
        const Location = await import('expo-location');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission refusée');
          setLocation({ lat: 5.3599517, lng: -4.0082563 });
        } else {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        }
      } catch {
        setLocation({ lat: 5.3599517, lng: -4.0082563 });
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, []);

  return { location, loading, error, refresh: fetchLocation };
}
