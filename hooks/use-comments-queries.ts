import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

/**
 * Hook para obtener comentarios de un plan
 */
export function usePlanComments(planId: string) {
  return trpc.comments.getByPlan.useQuery(
    { planId },
    {
      enabled: !!planId,
      staleTime: 2 * 60 * 1000, // 2 minutos
    }
  );
}

/**
 * Hook para obtener comentarios de un short
 */
export function useShortComments(shortId: string) {
  return trpc.comments.getByShort.useQuery(
    { shortId },
    {
      enabled: !!shortId,
      staleTime: 2 * 60 * 1000, // 2 minutos
    }
  );
}

/**
 * Hook para crear un comentario (plan o short)
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return trpc.comments.create.useMutation({
    onSuccess: (_, variables) => {
      // Invalidar la query correcta según el tipo
      if (variables.planId) {
        queryClient.invalidateQueries({
          queryKey: [["comments", "getByPlan"]],
        });
      } else if (variables.shortId) {
        queryClient.invalidateQueries({
          queryKey: [["comments", "getByShort"]],
        });
      }
    },
  });
}

/**
 * Hook para crear un comentario en un plan (alias por compatibilidad)
 */
export function useCreatePlanComment() {
  const queryClient = useQueryClient();

  return trpc.comments.createPlanComment.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["comments", "getByPlan"]],
      });
    },
  });
}
