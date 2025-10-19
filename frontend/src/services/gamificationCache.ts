// Shared cache service for gamification API calls
class GamificationCache {
  private cache = new Map<string, { data: any; timestamp: number; promise?: Promise<any> }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private readonly pendingRequests = new Map<string, Promise<any>>();

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.CACHE_DURATION;
  }

  async get<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    
    // Return cached data if valid
    if (cached && !this.isExpired(cached.timestamp)) {
      console.log(`Using cached data for: ${key}`);
      return cached.data;
    }

    // Check if there's already a pending request for this key
    const pendingRequest = this.pendingRequests.get(key);
    if (pendingRequest) {
      console.log(`Using pending request for: ${key}`);
      return pendingRequest;
    }

    // Create new request
    console.log(`Making new API request for: ${key}`);
    const promise = fetchFn()
      .then(data => {
        // Cache the successful response
        this.cache.set(key, { data, timestamp: Date.now() });
        this.pendingRequests.delete(key);
        return data;
      })
      .catch(error => {
        // Remove from pending requests on error
        this.pendingRequests.delete(key);
        throw error;
      });

    // Store pending request to prevent duplicates
    this.pendingRequests.set(key, promise);
    return promise;
  }

  invalidate(key?: string) {
    if (key) {
      this.cache.delete(key);
      this.pendingRequests.delete(key);
    } else {
      this.cache.clear();
      this.pendingRequests.clear();
    }
  }

  // Clear expired entries
  cleanup() {
    for (const [key, cached] of this.cache.entries()) {
      if (this.isExpired(cached.timestamp)) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const gamificationCache = new GamificationCache();

// Cleanup expired cache entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    gamificationCache.cleanup();
  }, 5 * 60 * 1000);
}