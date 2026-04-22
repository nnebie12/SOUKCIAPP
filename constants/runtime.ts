const envMockFallback = process.env.EXPO_PUBLIC_ENABLE_MOCK_FALLBACK === '1';

export const isMockFallbackEnabled = __DEV__ || envMockFallback;

export function mergeByIdWithOptionalFallback<T extends { id: string }>(
  primary: T[] | null | undefined,
  fallback: T[] = []
): T[] {
  const primaryItems = primary ?? [];

  if (!isMockFallbackEnabled) {
    return primaryItems;
  }

  const seen = new Set<string>();
  const merged: T[] = [];

  for (const item of [...primaryItems, ...fallback]) {
    if (seen.has(item.id)) {
      continue;
    }
    seen.add(item.id);
    merged.push(item);
  }

  return merged;
}

export function itemWithOptionalFallback<T>(
  primary: T | null | undefined,
  fallback: T | null
): T | null {
  if (primary) {
    return primary;
  }

  return isMockFallbackEnabled ? fallback : null;
}
