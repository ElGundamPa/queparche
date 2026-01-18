import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/hooks/use-auth-store";

/**
 * Hook para obtener la lista de amigos
 */
export function useFriends(userId?: string) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.currentUser);
  const targetUserId = userId || currentUser?.id;

  const query = trpc.friends.getFriends.useQuery(
    { userId: targetUserId },
    {
      enabled: !!targetUserId,
      staleTime: 2 * 60 * 1000, // 2 minutos
    }
  );

  // Suscripción a cambios en friendships
  useEffect(() => {
    if (!targetUserId) return;

    const channel = supabase
      .channel(`friendships:${targetUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `or(requester_id=eq.${targetUserId},addressee_id=eq.${targetUserId})`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: [["friends", "getFriends"]],
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [targetUserId, queryClient]);

  return query;
}

/**
 * Hook para obtener los seguidores de un usuario
 */
export function useFollowers(userId?: string) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.currentUser);
  const targetUserId = userId || currentUser?.id;

  const query = trpc.follows.getFollowers.useQuery(
    { userId: targetUserId },
    {
      enabled: !!targetUserId,
      staleTime: 2 * 60 * 1000, // 2 minutos
    }
  );

  // Suscripción a cambios en follows (nuevos seguidores)
  useEffect(() => {
    if (!targetUserId) return;

    const channel = supabase
      .channel(`followers:${targetUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${targetUserId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: [["follows", "getFollowers"]],
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [targetUserId, queryClient]);

  return query;
}

/**
 * Hook para obtener los usuarios que sigue un usuario
 */
export function useFollowing(userId?: string) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.currentUser);
  const targetUserId = userId || currentUser?.id;

  const query = trpc.follows.getFollowing.useQuery(
    { userId: targetUserId },
    {
      enabled: !!targetUserId,
      staleTime: 2 * 60 * 1000, // 2 minutos
    }
  );

  // Suscripción a cambios en follows (nuevos siguiendo)
  useEffect(() => {
    if (!targetUserId) return;

    const channel = supabase
      .channel(`following:${targetUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `follower_id=eq.${targetUserId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: [["follows", "getFollowing"]],
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [targetUserId, queryClient]);

  return query;
}

/**
 * Hook para seguir a un usuario
 */
export function useFollowUser() {
  const queryClient = useQueryClient();

  return trpc.follows.followUser.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["follows", "getFollowing"]],
      });
      queryClient.invalidateQueries({
        queryKey: [["follows", "getFollowers"]],
      });
    },
  });
}

/**
 * Hook para dejar de seguir a un usuario
 */
export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return trpc.follows.unfollowUser.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["follows", "getFollowing"]],
      });
      queryClient.invalidateQueries({
        queryKey: [["follows", "getFollowers"]],
      });
    },
  });
}
