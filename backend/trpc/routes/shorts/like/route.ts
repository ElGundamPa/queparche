import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export default protectedProcedure
  .input(z.object({
    shortId: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Check if already liked
    const { data: existingLike } = await ctx.supabase
      .from('likes')
      .select('id')
      .eq('short_id', input.shortId)
      .eq('user_id', ctx.user.id)
      .maybeSingle();

    if (existingLike) {
      // Unlike
      const { error } = await ctx.supabase
        .from('likes')
        .delete()
        .eq('short_id', input.shortId)
        .eq('user_id', ctx.user.id);

      if (error) {
        throw new Error(`Error al quitar like: ${error.message}`);
      }

      return { liked: false };
    } else {
      // Like
      const { error } = await ctx.supabase
        .from('likes')
        .insert({
          short_id: input.shortId,
          user_id: ctx.user.id,
        });

      if (error) {
        throw new Error(`Error al dar like: ${error.message}`);
      }

      return { liked: true };
    }
  });