import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/hooks/use-auth-store";

/**
 * Hook para obtener todas las notificaciones del usuario
 */
export function useNotifications() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.currentUser);

  const query = trpc.notifications.getAll.useQuery(undefined, {
    enabled: !!currentUser,
    staleTime: 30 * 1000, // 30 segundos
  });

  // Suscripción a notificaciones nuevas en tiempo real
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel(`notifications:${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`,
        },
        () => {
          // Invalidar query para refrescar notificaciones
          queryClient.invalidateQueries({
            queryKey: [["notifications", "getAll"]],
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser, queryClient]);

  // Calcular contador de notificaciones no leídas
  const unreadCount = query.data?.filter((n) => !n.is_read).length ?? 0;

  return {
    ...query,
    unreadCount,
  };
}

/**
 * Hook para marcar una notificación como leída
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["notifications", "getAll"]],
      });
    },
  });
}

/**
 * Hook para marcar todas las notificaciones como leídas
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["notifications", "getAll"]],
      });
    },
  });
}

/**
 * Hook para eliminar una notificación
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return trpc.notifications.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["notifications", "getAll"]],
      });
    },
  });
}
