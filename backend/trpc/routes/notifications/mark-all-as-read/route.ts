import { protectedProcedure } from "../../../create-context";

export default protectedProcedure.mutation(async ({ ctx }) => {
  const { error } = await ctx.supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', ctx.user.id)
    .eq('is_read', false);

  if (error) {
    throw new Error(`Error al marcar todas las notificaciones como leídas: ${error.message}`);
  }

  return { success: true };
});
