import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export default protectedProcedure
  .input(z.object({
    userId: z.string().optional(),
  }))
  .query(async ({ ctx, input }) => {
    const targetUserId = input.userId || ctx.user.id;

    const { data, error } = await ctx.supabase
      .from('friendships')
      .select(`
        id,
        status,
        created_at,
        requester:profiles!requester_id(
          id,
          name,
          username,
          avatar,
          bio
        ),
        addressee:profiles!addressee_id(
          id,
          name,
          username,
          avatar,
          bio
        )
      `)
      .or(`requester_id.eq.${targetUserId},addressee_id.eq.${targetUserId}`)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener amigos: ${error.message}`);
    }

    // Mapear para obtener el amigo (no el usuario actual)
    const friends = data?.map((friendship) => {
      const friend = friendship.requester.id === targetUserId
        ? friendship.addressee
        : friendship.requester;

      return {
        ...friendship,
        friend,
      };
    });

    return friends || [];
  });
