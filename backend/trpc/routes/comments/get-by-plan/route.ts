import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export default publicProcedure
  .input(z.object({ planId: z.string() }))
  .query(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('comments')
      .select(`
        *,
        user:profiles!user_id(
          id,
          name,
          username,
          avatar,
          is_verified
        )
      `)
      .eq('plan_id', input.planId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener comentarios: ${error.message}`);
    }

    return data || [];
  });