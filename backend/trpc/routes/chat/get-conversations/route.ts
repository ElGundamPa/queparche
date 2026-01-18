import { protectedProcedure } from "../../../create-context";

export default protectedProcedure.query(async ({ ctx }) => {
  // Obtener todas las conversaciones del usuario
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
      ),
      receiver:profiles!receiver_id(
        id,
        name,
        username,
        avatar
      )
    `)
    .or(`sender_id.eq.${ctx.user.id},receiver_id.eq.${ctx.user.id}`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener conversaciones: ${error.message}`);
  }

  // Agrupar mensajes por conversación (usuario)
  const conversationsMap = new Map();

  data?.forEach((message) => {
    const otherUserId = message.sender_id === ctx.user.id
      ? message.receiver_id
      : message.sender_id;

    const otherUser = message.sender_id === ctx.user.id
      ? message.receiver
      : message.sender;

    if (!conversationsMap.has(otherUserId)) {
      conversationsMap.set(otherUserId, {
        userId: otherUserId,
        user: otherUser,
        lastMessage: message,
        unreadCount: 0,
      });
    }

    // Contar mensajes no leídos
    if (message.receiver_id === ctx.user.id && !message.is_read) {
      const conversation = conversationsMap.get(otherUserId);
      conversation.unreadCount++;
    }
  });

  return Array.from(conversationsMap.values());
});
