import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/hooks/use-auth-store";

/**
 * Hook para obtener mensajes de una conversación
 */
export function useChatMessages(recipientId: string) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.currentUser);

  const query = trpc.chat.getMessages.useQuery(
    { recipientId },
    {
      enabled: !!recipientId && !!currentUser,
      staleTime: 1 * 60 * 1000, // 1 minuto
    }
  );

  // Suscripción a mensajes nuevos en tiempo real
  useEffect(() => {
    if (!recipientId || !currentUser) return;

    const channel = supabase
      .channel(`chat:${currentUser.id}:${recipientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `or(and(sender_id=eq.${currentUser.id},receiver_id=eq.${recipientId}),and(sender_id=eq.${recipientId},receiver_id=eq.${currentUser.id}))`,
        },
        (payload) => {
          // Invalidar query para refrescar con el nuevo mensaje
          queryClient.invalidateQueries({
            queryKey: [["chat", "getMessages"], { recipientId }],
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [recipientId, currentUser, queryClient]);

  return query;
}

/**
 * Hook para obtener todas las conversaciones
 */
export function useConversations() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.currentUser);

  const query = trpc.chat.getConversations.useQuery(undefined, {
    enabled: !!currentUser,
    staleTime: 30 * 1000, // 30 segundos
  });

  // Suscripción a mensajes nuevos para refrescar lista de conversaciones
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel(`conversations:${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `or(sender_id=eq.${currentUser.id},receiver_id=eq.${currentUser.id})`,
        },
        () => {
          // Invalidar query para refrescar lista de conversaciones
          queryClient.invalidateQueries({
            queryKey: [["chat", "getConversations"]],
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser, queryClient]);

  return query;
}

/**
 * Hook para enviar un mensaje
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return trpc.chat.sendMessage.useMutation({
    onSuccess: (_, variables) => {
      // Invalidar mensajes de la conversación
      queryClient.invalidateQueries({
        queryKey: [["chat", "getMessages"], { recipientId: variables.receiverId }],
      });
      // Invalidar lista de conversaciones
      queryClient.invalidateQueries({
        queryKey: [["chat", "getConversations"]],
      });
    },
  });
}

/**
 * Hook para marcar mensajes como leídos
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return trpc.chat.markAsRead.useMutation({
    onSuccess: (_, variables) => {
      // Invalidar mensajes de la conversación
      queryClient.invalidateQueries({
        queryKey: [["chat", "getMessages"], { recipientId: variables.senderId }],
      });
      // Invalidar lista de conversaciones
      queryClient.invalidateQueries({
        queryKey: [["chat", "getConversations"]],
      });
    },
  });
}
