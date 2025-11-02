// Advanced caching utilities for better performance
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expires: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

export class AdvancedCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private maxSize: number;
  private defaultTTL: number;
  private stats: CacheStats = { hits: 0, misses: 0, size: 0, hitRate: 0 };

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set(key: string, data: T, ttl?: number): void {
    const expires = Date.now() + (ttl || this.defaultTTL);
    
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expires
    });

    this.updateStats();
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    this.stats.hits++;
    this.updateStats();
    return item.data;
  }

  delete(key: string): boolean {
    const result = this.cache.delete(key);
    this.updateStats();
    return result;
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, size: 0, hitRate: 0 };
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private updateStats(): void {
    this.stats.size = this.cache.size;
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  // Clean expired items
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    this.updateStats();
    return cleaned;
  }
}

// Specialized caches for different data types
export const dashboardCache = new AdvancedCache<any>(50, 2 * 60 * 1000); // 2 minutes
export const subjectsCache = new AdvancedCache<any[]>(30, 5 * 60 * 1000); // 5 minutes
export const semestersCache = new AdvancedCache<any[]>(30, 5 * 60 * 1000); // 5 minutes
export const projectsCache = new AdvancedCache<any[]>(30, 10 * 60 * 1000); // 10 minutes
export const certificatesCache = new AdvancedCache<any[]>(30, 10 * 60 * 1000); // 10 minutes
export const gpaCache = new AdvancedCache<any>(20, 3 * 60 * 1000); // 3 minutes

// Cache key generators
export const CacheKeys = {
  dashboardStats: (userId: string, educationLevel: string) => `dashboard:${userId}:${educationLevel}`,
  subjects: (userId: string, educationLevel: string) => `subjects:${userId}:${educationLevel}`,
  semesters: (userId: string, educationLevel: string) => `semesters:${userId}:${educationLevel}`,
  projects: (userId: string, educationLevel: string) => `projects:${userId}:${educationLevel}`,
  certificates: (userId: string, educationLevel: string) => `certificates:${userId}:${educationLevel}`,
  gpaCalculation: (userId: string, educationLevel: string) => `gpa:${userId}:${educationLevel}`,
  profile: (userId: string) => `profile:${userId}`,
  semesterGPA: (userId: string, semesterId: string) => `semester-gpa:${userId}:${semesterId}`
};

// Cache utility functions
export function invalidateUserCache(userId: string): void {
  const caches = [dashboardCache, subjectsCache, semestersCache, projectsCache, certificatesCache, gpaCache];
  
  caches.forEach(cache => {
    // Get all keys and remove those belonging to the user
    const keysToDelete: string[] = [];
    
    // Since Map doesn't have a direct way to get keys, we'll use a different approach
    // We'll store keys in the cache and clean them periodically
    cache.clear(); // For now, clear all cache when user data changes
  });
}

export function invalidateEducationLevelCache(userId: string, educationLevel: string): void {
  const keys = [
    CacheKeys.dashboardStats(userId, educationLevel),
    CacheKeys.subjects(userId, educationLevel),
    CacheKeys.semesters(userId, educationLevel),
    CacheKeys.projects(userId, educationLevel),
    CacheKeys.certificates(userId, educationLevel),
    CacheKeys.gpaCalculation(userId, educationLevel)
  ];

  keys.forEach(key => {
    dashboardCache.delete(key);
    subjectsCache.delete(key);
    semestersCache.delete(key);
    projectsCache.delete(key);
    certificatesCache.delete(key);
    gpaCache.delete(key);
  });
}

// Cleanup expired cache items periodically
export function startCacheCleanup(): void {
  const cleanupInterval = 5 * 60 * 1000; // 5 minutes
  
  setInterval(() => {
    dashboardCache.cleanup();
    subjectsCache.cleanup();
    semestersCache.cleanup();
    projectsCache.cleanup();
    certificatesCache.cleanup();
    gpaCache.cleanup();
  }, cleanupInterval);
}

// Performance monitoring
export function getCachePerformanceReport(): {
  dashboard: CacheStats;
  subjects: CacheStats;
  semesters: CacheStats;
  projects: CacheStats;
  certificates: CacheStats;
  gpa: CacheStats;
} {
  return {
    dashboard: dashboardCache.getStats(),
    subjects: subjectsCache.getStats(),
    semesters: semestersCache.getStats(),
    projects: projectsCache.getStats(),
    certificates: certificatesCache.getStats(),
    gpa: gpaCache.getStats()
  };
}