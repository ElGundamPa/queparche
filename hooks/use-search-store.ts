import { useState, useEffect, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { storage } from '@/lib/storage';
import { Plan, Short } from '@/types/plan';
import { usePlansStore } from './use-plans-store';

export interface SearchFilters {
  category?: string;
  location?: string;
  priceRange?: [number, number];
  rating?: number;
  maxPeople?: number;
  dateRange?: [Date, Date];
}

export const [SearchProvider, useSearchStore] = createContextHook(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [recentPlans, setRecentPlans] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { plans, shorts } = usePlansStore();

  // Load cached data on mount
  useEffect(() => {
    loadCachedData();
  }, []);

  const loadCachedData = async () => {
    try {
      const [history, recent, favs] = await Promise.all([
        storage.getSearchHistory(),
        storage.getRecentPlans(),
        storage.getFavorites(),
      ]);
      
      setSearchHistory(history);
      setRecentPlans(recent);
      setFavorites(favs);
    } catch (error) {
      console.error('Error loading search data:', error);
    }
  };

  // Search functionality
  const performSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      await storage.addToSearchHistory(query);
      const updatedHistory = await storage.getSearchHistory();
      setSearchHistory(updatedHistory);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const clearSearchHistory = async () => {
    await storage.clearSearchHistory();
    setSearchHistory([]);
  };

  // Filter functionality
  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  // Favorites functionality
  const toggleFavorite = async (planId: string) => {
    const isFav = favorites.includes(planId);
    
    if (isFav) {
      await storage.removeFromFavorites(planId);
      setFavorites(prev => prev.filter(id => id !== planId));
    } else {
      await storage.addToFavorites(planId);
      setFavorites(prev => [...prev, planId]);
    }
  };

  const isFavorite = (planId: string) => favorites.includes(planId);

  // Recent plans functionality
  const addToRecentPlans = async (planId: string) => {
    await storage.addToRecentPlans(planId);
    const updated = await storage.getRecentPlans();
    setRecentPlans(updated);
  };

  // Search and filter logic
  const filteredPlans = useMemo(() => {
    let result = [...plans];

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(plan =>
        plan.name.toLowerCase().includes(query) ||
        plan.description.toLowerCase().includes(query) ||
        (plan.primaryCategory || plan.category || '').toLowerCase().includes(query) ||
        plan.location.address?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category) {
      result = result.filter(plan => (plan.primaryCategory || plan.category) === filters.category);
    }

    // Location filter
    if (filters.location) {
      const location = filters.location.toLowerCase();
      result = result.filter(plan =>
        plan.location.address?.toLowerCase().includes(location)
      );
    }

    // Rating filter
    if (filters.rating) {
      result = result.filter(plan => (plan.rating ?? 0) >= filters.rating!);
    }

    // Max people filter
    if (filters.maxPeople) {
      result = result.filter(plan => plan.maxPeople <= filters.maxPeople!);
    }

    // Date range filter (for events)
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      result = result.filter(plan => {
        if (!plan.eventDate) return true;
        const planDate = new Date(plan.eventDate);
        return planDate >= startDate && planDate <= endDate;
      });
    }

    return result;
  }, [plans, searchQuery, filters]);

  const filteredShorts = useMemo(() => {
    let result = [...shorts];

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(short =>
        short.placeName.toLowerCase().includes(query) ||
        short.description.toLowerCase().includes(query) ||
        short.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category) {
      result = result.filter(short => short.category === filters.category);
    }

    return result;
  }, [shorts, searchQuery, filters]);

  // Get plans by IDs (for recent and favorites)
  const getPlansById = (planIds: string[]) => {
    return planIds
      .map(id => plans.find(plan => plan.id === id))
      .filter(Boolean) as Plan[];
  };

  const recentPlansData = useMemo(() => getPlansById(recentPlans), [recentPlans, plans]);
  const favoritePlansData = useMemo(() => getPlansById(favorites), [favorites, plans]);

  // Search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const suggestions = new Set<string>();

    // Add matching plan names
    plans.forEach(plan => {
      if (plan.name.toLowerCase().includes(query)) {
        suggestions.add(plan.name);
      }
    });

    // Add matching categories
    plans.forEach(plan => {
      const categoryKey = (plan.primaryCategory || plan.category || '').toLowerCase();
      if (categoryKey.includes(query)) {
        suggestions.add(plan.primaryCategory || plan.category || '');
      }
    });

    // Add matching locations
    plans.forEach(plan => {
      if (plan.location.address?.toLowerCase().includes(query)) {
        suggestions.add(plan.location.address);
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }, [searchQuery, plans]);

  return {
    // Search state
    searchQuery,
    searchHistory,
    searchSuggestions,
    
    // Filter state
    filters,
    
    // Results
    filteredPlans,
    filteredShorts,
    recentPlansData,
    favoritePlansData,
    
    // Actions
    performSearch,
    clearSearch,
    clearSearchHistory,
    updateFilters,
    clearFilters,
    toggleFavorite,
    isFavorite,
    addToRecentPlans,
    
    // Computed
    hasActiveFilters: Object.keys(filters).length > 0,
    resultsCount: filteredPlans.length + filteredShorts.length,
  };
});

// Custom hook for search with debouncing
export function useDebouncedSearch(delay: number = 300) {
  const { performSearch } = useSearchStore();
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedQuery !== undefined) {
        performSearch(debouncedQuery);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [debouncedQuery, delay, performSearch]);

  return setDebouncedQuery;
}