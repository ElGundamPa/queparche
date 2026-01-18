import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export default protectedProcedure
  .input(z.object({
    receiverId: z.string(),
    content: z.string().min(1),
  }))
  .mutation(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('chat_messages')
      .insert({
        sender_id: ctx.user.id,
        receiver_id: input.receiverId,
        content: input.content,
        is_read: false,
      })
      .select(`
        id,
        sender_id,
        receiver_id,
        content,
        is_read,
        created_at
      `)
      .single();

    if (error) {
      throw new Error(`Error al enviar mensaje: ${error.message}`);
    }

    return data;
  });
