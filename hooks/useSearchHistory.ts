import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

const STORAGE_KEY = 'soukci_search_history';
const MAX_HISTORY = 20;

// Web: localStorage, Mobile: in-memory (AsyncStorage can be added later)
const storage = {
  get: (): string[] => {
    if (Platform.OS === 'web') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }
    return memoryHistory;
  },
  set: (data: string[]) => {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {}
    } else {
      memoryHistory = data;
    }
  },
};

let memoryHistory: string[] = [];

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory(storage.get());
  }, []);

  const addToHistory = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;

    setHistory((prev) => {
      const filtered = prev.filter((h) => h.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY);
      storage.set(updated);
      return updated;
    });
  }, []);

  const removeFromHistory = useCallback((query: string) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => h !== query);
      storage.set(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    storage.set([]);
    setHistory([]);
  }, []);

  return { history, addToHistory, removeFromHistory, clearHistory };
}
