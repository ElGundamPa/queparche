import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import createContextHook from "@nkzw/create-context-hook";

import { User, UserStats } from "@/types/user";
import { trpc } from "@/lib/trpc";

export const [UserProvider, useUserStore] = createContextHook(() => {
  const queryClient = useQueryClient();
  
  // Mock current user ID - in a real app this would come from auth
  const currentUserId = "1";

  // Fetch user profile
  const userQuery = trpc.users.getProfile.useQuery({ userId: currentUserId });

  // Fetch user stats
  const userStatsQuery = trpc.users.getStats.useQuery({ userId: currentUserId });

  // Update profile mutation
  const updateProfileMutation = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["users", "getProfile"]] });
      queryClient.invalidateQueries({ queryKey: [["users", "getStats"]] });
    },
  });

  const user = userQuery.data;
  const userStats = userStatsQuery.data;

  // Update user profile
  const updateProfile = (profileData: Partial<User>) => {
    updateProfileMutation.mutate({
      userId: currentUserId,
      ...profileData,
    });
  };

  return {
    user,
    userStats,
    currentUserId,
    isLoading: userQuery.isLoading,
    updateProfile,
    isUpdating: updateProfileMutation.isPending,
  };
});