import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plan, Short } from '@/types/plan';

export const STORAGE_KEYS = {
  PLANS: 'cached_plans',
  SHORTS: 'cached_shorts',
  FAVORITES: 'user_favorites',
  RECENT_PLANS: 'recent_plans',
  SEARCH_HISTORY: 'search_history',
  USER_PREFERENCES: 'user_preferences',
  LAST_SYNC: 'last_sync_timestamp',
  SESSION_DATA: 'session_data',
} as const;

export interface UserPreferences {
  categories: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  notifications: boolean;
  darkMode: boolean;
}

export interface SessionData {
  recentPlans: string[];
  searchHistory: string[];
  favorites: string[];
  lastActivity: string;
}

class StorageService {
  // Generic storage methods
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }

  // Plans caching
  async cachePlans(plans: Plan[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.PLANS, plans);
    await this.setItem(STORAGE_KEYS.LAST_SYNC, Date.now());
  }

  async getCachedPlans(): Promise<Plan[]> {
    const plans = await this.getItem<Plan[]>(STORAGE_KEYS.PLANS);
    return plans || [];
  }

  // Shorts caching
  async cacheShorts(shorts: Short[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.SHORTS, shorts);
  }

  async getCachedShorts(): Promise<Short[]> {
    const shorts = await this.getItem<Short[]>(STORAGE_KEYS.SHORTS);
    return shorts || [];
  }

  // Favorites management
  async addToFavorites(planId: string): Promise<void> {
    const favorites = await this.getFavorites();
    if (!favorites.includes(planId)) {
      favorites.push(planId);
      await this.setItem(STORAGE_KEYS.FAVORITES, favorites);
    }
  }

  async removeFromFavorites(planId: string): Promise<void> {
    const favorites = await this.getFavorites();
    const updated = favorites.filter(id => id !== planId);
    await this.setItem(STORAGE_KEYS.FAVORITES, updated);
  }

  async getFavorites(): Promise<string[]> {
    const favorites = await this.getItem<string[]>(STORAGE_KEYS.FAVORITES);
    return favorites || [];
  }

  async isFavorite(planId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.includes(planId);
  }

  // Recent plans
  async addToRecentPlans(planId: string): Promise<void> {
    const recent = await this.getRecentPlans();
    const updated = [planId, ...recent.filter(id => id !== planId)].slice(0, 10);
    await this.setItem(STORAGE_KEYS.RECENT_PLANS, updated);
  }

  async getRecentPlans(): Promise<string[]> {
    const recent = await this.getItem<string[]>(STORAGE_KEYS.RECENT_PLANS);
    return recent || [];
  }

  // Search history
  async addToSearchHistory(query: string): Promise<void> {
    if (!query.trim()) return;
    
    const history = await this.getSearchHistory();
    const updated = [query, ...history.filter(q => q !== query)].slice(0, 20);
    await this.setItem(STORAGE_KEYS.SEARCH_HISTORY, updated);
  }

  async getSearchHistory(): Promise<string[]> {
    const history = await this.getItem<string[]>(STORAGE_KEYS.SEARCH_HISTORY);
    return history || [];
  }

  async clearSearchHistory(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
  }

  // User preferences
  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  async getUserPreferences(): Promise<UserPreferences | null> {
    return await this.getItem<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES);
  }

  // Session management
  async updateSessionData(data: Partial<SessionData>): Promise<void> {
    const current = await this.getSessionData();
    const updated = { ...current, ...data, lastActivity: new Date().toISOString() };
    await this.setItem(STORAGE_KEYS.SESSION_DATA, updated);
  }

  async getSessionData(): Promise<SessionData> {
    const session = await this.getItem<SessionData>(STORAGE_KEYS.SESSION_DATA);
    return session || {
      recentPlans: [],
      searchHistory: [],
      favorites: [],
      lastActivity: new Date().toISOString(),
    };
  }

  // Cache management
  async getLastSyncTime(): Promise<number> {
    const timestamp = await this.getItem<number>(STORAGE_KEYS.LAST_SYNC);
    return timestamp || 0;
  }

  async isCacheStale(maxAge: number = 5 * 60 * 1000): Promise<boolean> {
    const lastSync = await this.getLastSyncTime();
    return Date.now() - lastSync > maxAge;
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    const keys = Object.values(STORAGE_KEYS);
    await Promise.all(keys.map(key => this.removeItem(key)));
  }

  // Export/Import data for backup
  async exportData(): Promise<Record<string, any>> {
    const data: Record<string, any> = {};
    const keys = Object.values(STORAGE_KEYS);
    
    for (const key of keys) {
      data[key] = await this.getItem(key);
    }
    
    return data;
  }

  async importData(data: Record<string, any>): Promise<void> {
    for (const [key, value] of Object.entries(data)) {
      if (value !== null) {
        await this.setItem(key, value);
      }
    }
  }
}

export const storage = new StorageService();