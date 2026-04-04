import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'soukci_search_history';
const MAX_HISTORY = 20;

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!isMounted) return;
        setHistory(raw ? JSON.parse(raw) : []);
      } catch {
        if (isMounted) setHistory([]);
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const addToHistory = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;

    setHistory((prev) => {
      const filtered = prev.filter((h) => h.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => undefined);
      return updated;
    });
  }, []);

  const removeFromHistory = useCallback((query: string) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => h !== query);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => undefined);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
    setHistory([]);
  }, []);

  return { history, addToHistory, removeFromHistory, clearHistory };
}
