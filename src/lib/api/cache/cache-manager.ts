interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private cache = new Map<string, CacheItem>();
  private maxSize: number = 100; // Nombre max d'items en cache
  private cleanupInterval: NodeJS.Timeout;

  constructor(cleanupTimeMinutes: number = 5) {
    this.cleanupInterval = setInterval(() => this.cleanup(), cleanupTimeMinutes * 60 * 1000);
  }

  set<T>(key: string, data: T, ttl: number): void {
    // Éviter la surcharge mémoire
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  invalidate(pattern?: string | RegExp): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (pattern instanceof RegExp && pattern.test(key)) {
        this.cache.delete(key);
      } else if (typeof pattern === 'string' && key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

export const cacheManager = new CacheManager();