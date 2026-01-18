import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export default protectedProcedure
  .input(z.object({
    userId: z.string().optional(),
  }))
  .query(async ({ ctx, input }) => {
    const targetUserId = input.userId || ctx.user.id;

    const { data, error } = await ctx.supabase
      .from('follows')
      .select(`
        id,
        created_at,
        follower:profiles!follower_id(
          id,
          name,
          username,
          avatar,
          bio
        )
      `)
      .eq('following_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener seguidores: ${error.message}`);
    }

    return data || [];
  });
