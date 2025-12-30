import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Cache service wrapper for Redis/in-memory caching
 * Provides type-safe caching with automatic serialization
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value) {
        this.logger.debug(`Cache HIT: ${key}`);
        return value;
      }
      this.logger.debug(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      this.logger.error(`Cache GET error for key ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Cache SET: ${key} (TTL: ${ttl || 'default'})`);
    } catch (error) {
      this.logger.error(`Cache SET error for key ${key}:`, error.message);
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache DEL: ${key}`);
    } catch (error) {
      this.logger.error(`Cache DEL error for key ${key}:`, error.message);
    }
  }

  /**
   * Delete multiple keys matching pattern (Redis only)
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      // Get Redis store - using stores array in v6
      const stores = (this.cacheManager as any).stores;
      const store = stores ? stores[0] : null;

      if (store.client && typeof store.client.keys === 'function') {
        // Redis store - use pattern matching
        const keys = await store.client.keys(pattern);
        if (keys.length > 0) {
          await Promise.all(keys.map((key: string) => this.del(key)));
          this.logger.debug(`Cache DEL pattern: ${pattern} (${keys.length} keys)`);
        }
      } else {
        // In-memory store - no pattern support
        this.logger.warn('Pattern deletion not supported for in-memory cache');
      }
    } catch (error) {
      this.logger.error(`Cache DEL pattern error for ${pattern}:`, error.message);
    }
  }

  /**
   * Clear all cache
   */
  async reset(): Promise<void> {
    try {
      // cache-manager v6 doesn't have reset(), manually clear keys
      const stores = (this.cacheManager as any).stores;
      if (stores && stores[0] && stores[0].reset) {
        await stores[0].reset();
      }
      this.logger.log('Cache cleared');
    } catch (error) {
      this.logger.error('Cache RESET error:', error.message);
    }
  }

  /**
   * Wrap a function with caching
   */
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    try {
      // Try to get from cache
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // Execute function and cache result
      const result = await fn();
      await this.set(key, result, ttl);
      return result;
    } catch (error) {
      this.logger.error(`Cache WRAP error for key ${key}:`, error.message);
      // Fallback to executing function without cache
      return fn();
    }
  }

  /**
   * Get or set with callback (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    return this.wrap(key, factory, ttl);
  }

  /**
   * Get cache statistics (Redis only)
   */
  async getStats(): Promise<any> {
    try {
      const stores = (this.cacheManager as any).stores;
      const store = stores ? stores[0] : null;

      if (store.client && typeof store.client.info === 'function') {
        // Redis store - get info
        const info = await store.client.info('stats');
        return {
          backend: 'redis',
          info,
        };
      } else {
        // In-memory store
        return {
          backend: 'memory',
          message: 'Statistics not available for in-memory cache',
        };
      }
    } catch (error) {
      return {
        backend: 'unknown',
        error: error.message,
      };
    }
  }

  /**
   * Check if cache is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testKey = 'health_check_test';
      const testValue = { timestamp: Date.now() };

      await this.set(testKey, testValue, 5000); // 5 seconds TTL
      const retrieved = await this.get(testKey);
      await this.del(testKey);

      return retrieved !== null;
    } catch (error) {
      this.logger.error('Cache health check failed:', error.message);
      return false;
    }
  }
}
