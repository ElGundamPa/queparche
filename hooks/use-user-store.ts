import { useState, useEffect } from "react";
import createContextHook from "@nkzw/create-context-hook";

import { User, UserStats } from "@/types/user";
import { mockUsers } from "@/mocks/users";
import { mockPlans } from "@/mocks/plans";

export const [UserProvider, useUserStore] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Mock current user ID - in a real app this would come from auth
  const currentUserId = "1";

  // Simulate loading user data
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get user from mock data
      const foundUser = mockUsers.find(u => u.id === currentUserId);
      if (foundUser) {
        setUser(foundUser);
        
        // Calculate user stats from mock plans
        const userPlans = mockPlans.filter(p => p.userId === currentUserId);
        const totalLikes = userPlans.reduce((sum, plan) => sum + (plan.likes ?? 0), 0);
        const totalReviews = userPlans.reduce((sum, plan) => sum + (plan.reviewCount ?? 0), 0);
        const averageRating = userPlans.length > 0 
          ? userPlans.reduce((sum, plan) => sum + (plan.rating ?? 0), 0) / userPlans.length 
          : 0;
        
        const categoryCount: { [key: string]: number } = {};
        userPlans.forEach(plan => {
          const key = plan.primaryCategory || plan.category || 'otros';
          categoryCount[key] = (categoryCount[key] || 0) + 1;
        });
        
        const favoriteCategories = Object.entries(categoryCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([category]) => category);

        setUserStats({
          totalPlans: userPlans.length,
          totalAttended: 47,
          totalLikes,
          totalReviews,
          averageRating,
          favoriteCategories,
        });
      }
      
      setIsLoading(false);
    };

    loadUserData();
  }, [currentUserId]);

  // Update user profile
  const updateProfile = async (profileData: Partial<User>) => {
    setIsUpdating(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (user) {
      setUser({ ...user, ...profileData });
    }
    
    setIsUpdating(false);
  };

  return {
    user,
    userStats,
    currentUserId,
    isLoading,
    updateProfile,
    isUpdating,
  };
});