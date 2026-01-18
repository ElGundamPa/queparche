import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export default protectedProcedure
  .input(z.object({
    notificationId: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { error } = await ctx.supabase
      .from('notifications')
      .delete()
      .eq('id', input.notificationId)
      .eq('user_id', ctx.user.id);

    if (error) {
      throw new Error(`Error al eliminar notificación: ${error.message}`);
    }

    return { success: true };
  });
