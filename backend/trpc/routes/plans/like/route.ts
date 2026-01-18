import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export default protectedProcedure
  .input(z.object({
    planId: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Check if already liked
    const { data: existingLike } = await ctx.supabase
      .from('likes')
      .select('id')
      .eq('plan_id', input.planId)
      .eq('user_id', ctx.user.id)
      .maybeSingle();

    if (existingLike) {
      // Unlike - remove the like
      const { error } = await ctx.supabase
        .from('likes')
        .delete()
        .eq('plan_id', input.planId)
        .eq('user_id', ctx.user.id);

      if (error) {
        throw new Error(`Error al quitar like: ${error.message}`);
      }

      return { liked: false };
    } else {
      // Like - add the like
      const { error } = await ctx.supabase
        .from('likes')
        .insert({
          plan_id: input.planId,
          user_id: ctx.user.id,
        });

      if (error) {
        throw new Error(`Error al dar like: ${error.message}`);
      }

      return { liked: true };
    }
  });