import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export default protectedProcedure
  .input(z.object({
    notificationId: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { error } = await ctx.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', input.notificationId)
      .eq('user_id', ctx.user.id);

    if (error) {
      throw new Error(`Error al marcar notificación como leída: ${error.message}`);
    }

    return { success: true };
  });
