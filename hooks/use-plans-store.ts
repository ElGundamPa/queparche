import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from "@nkzw/create-context-hook";

import { Plan, Short, Event } from "@/types/plan";
import { trpc } from "@/lib/trpc";
import { mockPlans } from "@/mocks/plans";
import { mockEvents } from "@/mocks/events";
import { mockShorts } from "@/mocks/shorts";

const CACHE_KEYS = {
  PLANS: 'cached_plans',
  SHORTS: 'cached_shorts',
  LAST_SYNC: 'last_sync_timestamp'
};

export const [PlansProvider, usePlansStore] = createContextHook(() => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [events] = useState<Event[]>(mockEvents);
  const [cachedPlans, setCachedPlans] = useState<Plan[]>(mockPlans);
  const [cachedShorts, setCachedShorts] = useState<Short[]>(mockShorts);
  const queryClient = useQueryClient();

  // Load cached data on mount
  useEffect(() => {
    loadCachedData();
  }, []);

  const loadCachedData = async () => {
    try {
      const [plansData, shortsData] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEYS.PLANS),
        AsyncStorage.getItem(CACHE_KEYS.SHORTS)
      ]);
      
      if (plansData) {
        setCachedPlans(JSON.parse(plansData));
      }
      if (shortsData) {
        setCachedShorts(JSON.parse(shortsData));
      } else {
        // Si no hay datos en caché, usar los mock shorts
        setCachedShorts(mockShorts);
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
      // En caso de error, asegurar que tenemos los mock shorts
      setCachedShorts(mockShorts);
    }
  };

  const saveCachedData = async (plans: Plan[], shorts: Short[]) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(CACHE_KEYS.PLANS, JSON.stringify(plans)),
        AsyncStorage.setItem(CACHE_KEYS.SHORTS, JSON.stringify(shorts)),
        AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString())
      ]);
    } catch (error) {
      console.error('Error saving cached data:', error);
    }
  };

  // Fetch plans from backend
  const plansQuery = trpc.plans.getAll.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch shorts from backend
  const shortsQuery = trpc.shorts.getAll.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update cached data when queries succeed
  useEffect(() => {
    if (plansQuery.data) {
      setCachedPlans(plansQuery.data);
      saveCachedData(plansQuery.data, cachedShorts);
    }
  }, [plansQuery.data, cachedShorts]);

  useEffect(() => {
    if (shortsQuery.data) {
      setCachedShorts(shortsQuery.data);
      saveCachedData(cachedPlans, shortsQuery.data);
    }
  }, [shortsQuery.data, cachedPlans]);

  // Create plan mutation with optimistic updates
  const createPlanMutation = trpc.plans.create.useMutation({
    onMutate: async (newPlan) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [["plans", "getAll"]] });
      
      // Snapshot previous value
      const previousPlans = queryClient.getQueryData([["plans", "getAll"]]);
      
      // Optimistically update cache
      const optimisticPlan: Plan = {
        id: `temp-${Date.now()}`,
        ...newPlan,
        currentPeople: 1,
        likes: 0,
        favorites: 0,
        rating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
      };
      
      const updatedPlans = [optimisticPlan, ...cachedPlans];
      setCachedPlans(updatedPlans);
      queryClient.setQueryData([["plans", "getAll"]], updatedPlans);
      saveCachedData(updatedPlans, cachedShorts);
      
      return { previousPlans };
    },
    onError: (err, newPlan, context) => {
      // Rollback on error
      if (context?.previousPlans) {
        queryClient.setQueryData([["plans", "getAll"]], context.previousPlans);
        setCachedPlans(context.previousPlans as Plan[]);
        saveCachedData(context.previousPlans as Plan[], cachedShorts);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [["plans", "getAll"]] });
    },
  });

  // Join plan mutation
  const joinPlanMutation = trpc.plans.join.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["plans", "getAll"]] });
    },
  });

  // Like plan mutation with optimistic updates
  const likePlanMutation = trpc.plans.like.useMutation({
    onMutate: async ({ planId }) => {
      await queryClient.cancelQueries({ queryKey: [["plans", "getAll"]] });
      
      const previousPlans = queryClient.getQueryData([["plans", "getAll"]]);
      
      // Optimistically update likes
      const updatedPlans = cachedPlans.map(plan => 
        plan.id === planId 
          ? { ...plan, likes: plan.likes + 1 }
          : plan
      );
      
      setCachedPlans(updatedPlans);
      queryClient.setQueryData([["plans", "getAll"]], updatedPlans);
      
      return { previousPlans };
    },
    onError: (err, variables, context) => {
      if (context?.previousPlans) {
        queryClient.setQueryData([["plans", "getAll"]], context.previousPlans);
        setCachedPlans(context.previousPlans as Plan[]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["plans", "getAll"]] });
    },
  });

  // Create short mutation with optimistic updates
  const createShortMutation = trpc.shorts.create.useMutation({
    onMutate: async (newShort) => {
      await queryClient.cancelQueries({ queryKey: [["shorts", "getAll"]] });
      
      const previousShorts = queryClient.getQueryData([["shorts", "getAll"]]);
      
      const optimisticShort: Short = {
        id: `temp-${Date.now()}`,
        ...newShort,
        likes: 0,
        favorites: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
      };
      
      const updatedShorts = [optimisticShort, ...cachedShorts];
      setCachedShorts(updatedShorts);
      queryClient.setQueryData([["shorts", "getAll"]], updatedShorts);
      
      return { previousShorts };
    },
    onError: (err, newShort, context) => {
      if (context?.previousShorts) {
        queryClient.setQueryData([["shorts", "getAll"]], context.previousShorts);
        setCachedShorts(context.previousShorts as Short[]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["shorts", "getAll"]] });
    },
  });

  // Like short mutation
  const likeShortMutation = trpc.shorts.like.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["shorts", "getAll"]] });
    },
  });

  // Favorite short mutation
  const favoriteShortMutation = trpc.shorts.favorite.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["shorts", "getAll"]] });
    },
  });

  // Use cached data as fallback while loading, or mock data if no backend
  const plans = plansQuery.data || cachedPlans || mockPlans;
  const shorts = shortsQuery.data || cachedShorts || mockShorts;

  // Add a new plan
  const addPlan = (planData: Omit<Plan, 'id' | 'currentPeople' | 'likes' | 'favorites' | 'createdAt' | 'rating' | 'reviewCount'>) => {
    createPlanMutation.mutate(planData);
  };

  // Join a plan
  const joinPlan = (planId: string) => {
    joinPlanMutation.mutate({ planId });
  };

  // Like a plan
  const likePlan = (planId: string) => {
    likePlanMutation.mutate({ planId });
  };

  // Add a new short
  const addShort = (shortData: Omit<Short, 'id' | 'likes' | 'favorites' | 'comments' | 'createdAt'>) => {
    createShortMutation.mutate(shortData);
  };

  // Like a short
  const likeShort = (shortId: string) => {
    likeShortMutation.mutate({ shortId });
  };

  // Favorite a short
  const favoriteShort = (shortId: string) => {
    favoriteShortMutation.mutate({ shortId });
  };

  // Get a random plan
  const getRandomPlan = () => {
    const filteredPlans = selectedCategory
      ? plans.filter((plan) => plan.category === selectedCategory)
      : plans;
    
    if (filteredPlans.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * filteredPlans.length);
    return filteredPlans[randomIndex];
  };

  return {
    plans,
    shorts,
    events,
    isLoading: plansQuery.isLoading || shortsQuery.isLoading,
    isOnline: !plansQuery.isError && !shortsQuery.isError,
    selectedCategory,
    setSelectedCategory,
    addPlan,
    joinPlan,
    likePlan,
    addShort,
    likeShort,
    favoriteShort,
    getRandomPlan,
    refreshData: () => {
      plansQuery.refetch();
      shortsQuery.refetch();
    },
  };
});

// Custom hook to get filtered plans
export function useFilteredPlans(searchQuery: string = "") {
  const { plans, selectedCategory } = usePlansStore();
  
  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = searchQuery
      ? plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.location.address?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const matchesCategory = selectedCategory
      ? plan.category === selectedCategory
      : true;
    
    return matchesSearch && matchesCategory;
  });
  
  return filteredPlans;
}

// Custom hook to get top 5 plans
export function useTopPlans() {
  const { plans } = usePlansStore();
  
  // Sort by rating, likes, and favorites combined
  const sortedPlans = [...plans].sort(
    (a, b) => {
      const scoreA = (a.rating * 2) + a.likes + a.favorites;
      const scoreB = (b.rating * 2) + b.likes + b.favorites;
      return scoreB - scoreA;
    }
  );
  
  return sortedPlans.slice(0, 5);
}