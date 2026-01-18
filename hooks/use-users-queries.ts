import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/hooks/use-auth-store";

/**
 * Hook para obtener el perfil de un usuario
 */
export function useUserProfile(userId?: string) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const targetUserId = userId || currentUser?.id;

  return trpc.users.getProfile.useQuery(
    { userId: targetUserId! },
    {
      enabled: !!targetUserId,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }
  );
}

/**
 * Hook para obtener las estadísticas de un usuario
 */
export function useUserStats(userId?: string) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const targetUserId = userId || currentUser?.id;

  return trpc.users.getStats.useQuery(
    { userId: targetUserId! },
    {
      enabled: !!targetUserId,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }
  );
}

/**
 * Hook para actualizar el perfil del usuario actual
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.currentUser);

  return trpc.users.updateProfile.useMutation({
    onMutate: async (newData) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({
        queryKey: [["users", "getProfile"]],
      });

      // Snapshot del valor anterior
      const previousProfile = queryClient.getQueryData([
        ["users", "getProfile"],
        { userId: currentUser?.id },
      ]);

      // Update optimista
      if (currentUser?.id) {
        queryClient.setQueryData(
          [["users", "getProfile"], { userId: currentUser.id }],
          (old: any) => ({
            ...old,
            ...newData,
          })
        );
      }

      return { previousProfile };
    },
    onError: (err, newData, context) => {
      // Rollback en caso de error
      if (context?.previousProfile && currentUser?.id) {
        queryClient.setQueryData(
          [["users", "getProfile"], { userId: currentUser.id }],
          context.previousProfile
        );
      }
    },
    onSuccess: () => {
      // Refrescar datos
      queryClient.invalidateQueries({
        queryKey: [["users", "getProfile"]],
      });
      queryClient.invalidateQueries({
        queryKey: [["users", "getStats"]],
      });
    },
  });
}

/**
 * Hook combinado que obtiene tanto el perfil como las stats
 */
export function useUserData(userId?: string) {
  const profile = useUserProfile(userId);
  const stats = useUserStats(userId);

  return {
    user: profile.data,
    userStats: stats.data,
    isLoading: profile.isLoading || stats.isLoading,
    isError: profile.isError || stats.isError,
    refetch: () => {
      profile.refetch();
      stats.refetch();
    },
  };
}
