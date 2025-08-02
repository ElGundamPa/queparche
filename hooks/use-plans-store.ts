import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import createContextHook from "@nkzw/create-context-hook";

import { Plan, Short, Event } from "@/types/plan";
import { trpc } from "@/lib/trpc";
import { mockEvents } from "@/mocks/events";

export const [PlansProvider, usePlansStore] = createContextHook(() => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [events] = useState<Event[]>(mockEvents);
  const queryClient = useQueryClient();

  // Fetch plans from backend
  const plansQuery = trpc.plans.getAll.useQuery();
  
  // Fetch shorts from backend
  const shortsQuery = trpc.shorts.getAll.useQuery();

  // Create plan mutation
  const createPlanMutation = trpc.plans.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["plans", "getAll"]] });
    },
  });

  // Join plan mutation
  const joinPlanMutation = trpc.plans.join.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["plans", "getAll"]] });
    },
  });

  // Like plan mutation
  const likePlanMutation = trpc.plans.like.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["plans", "getAll"]] });
    },
  });

  // Create short mutation
  const createShortMutation = trpc.shorts.create.useMutation({
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

  const plans = plansQuery.data || [];
  const shorts = shortsQuery.data || [];

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
    selectedCategory,
    setSelectedCategory,
    addPlan,
    joinPlan,
    likePlan,
    addShort,
    likeShort,
    favoriteShort,
    getRandomPlan,
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