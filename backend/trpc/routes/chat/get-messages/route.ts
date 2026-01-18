import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export default protectedProcedure
  .input(z.object({
    recipientId: z.string(),
  }))
  .query(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('chat_messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        content,
        is_read,
        created_at,
        sender:profiles!sender_id(
          id,
          name,
          username,
          avatar
        )
      `)
      .or(`and(sender_id.eq.${ctx.user.id},receiver_id.eq.${input.recipientId}),and(sender_id.eq.${input.recipientId},receiver_id.eq.${ctx.user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error al obtener mensajes: ${error.message}`);
    }

    return data || [];
  });
