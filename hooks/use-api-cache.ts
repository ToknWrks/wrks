const CACHE_DURATION = 60 * 1000; // 1 minute
const STALE_WHILE_REVALIDATE = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: any;
  timestamp: number;
  staleTimestamp: number;
}

interface Cache {
  [key: string]: CacheEntry;
}

const cache: Cache = {};

export function useApiCache() {
  const getCachedData = (key: string) => {
    const entry = cache[key];
    if (!entry) return null;

    const now = Date.now();

    // Return fresh data
    if (now - entry.timestamp <= CACHE_DURATION) {
      return entry.data;
    }

    // Return stale data while revalidating
    if (now - entry.staleTimestamp <= STALE_WHILE_REVALIDATE) {
      return entry.data;
    }

    // Data is too old, remove it
    delete cache[key];
    return null;
  };

  const setCachedData = (key: string, data: any) => {
    const now = Date.now();
    cache[key] = {
      data,
      timestamp: now,
      staleTimestamp: now
    };
  };

  const updateStaleTimestamp = (key: string) => {
    const entry = cache[key];
    if (entry) {
      entry.staleTimestamp = Date.now();
    }
  };

  return {
    getCachedData,
    setCachedData,
    updateStaleTimestamp
  };
}