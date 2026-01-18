import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export default protectedProcedure
  .input(z.object({
    followingId: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { error } = await ctx.supabase
      .from('follows')
      .delete()
      .eq('follower_id', ctx.user.id)
      .eq('following_id', input.followingId);

    if (error) {
      throw new Error(`Error al dejar de seguir usuario: ${error.message}`);
    }

    return { success: true };
  });
