import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export default protectedProcedure
  .input(z.object({
    senderId: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Marcar como leídos todos los mensajes de senderId hacia el usuario actual
    const { error } = await ctx.supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('sender_id', input.senderId)
      .eq('receiver_id', ctx.user.id)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Error al marcar mensajes como leídos: ${error.message}`);
    }

    return { success: true };
  });
