import { CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

export const cacheConfig = async (): Promise<CacheModuleOptions> => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  // Parse Redis URL for Railway compatibility
  const isProduction = process.env.NODE_ENV === 'production';

  try {
    const store = await redisStore({
      url: redisUrl,
      ttl: 60 * 1000, // Default TTL: 60 seconds
      // Connection options
      socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('❌ Redis: Max reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          // Exponential backoff: 100ms, 200ms, 400ms, 800ms, etc.
          return Math.min(retries * 100, 3000);
        },
      },
    });

    console.log(`✅ Redis cache configured: ${redisUrl.replace(/:[^:]*@/, ':***@')}`);

    return {
      store,
      isGlobal: true,
    };
  } catch (error) {
    console.warn('⚠️  Redis not available, using in-memory cache:', error.message);

    // Fallback to in-memory cache if Redis is not available
    return {
      isGlobal: true,
      ttl: 60 * 1000, // 60 seconds
      max: 1000, // Maximum number of items in cache
    };
  }
};
