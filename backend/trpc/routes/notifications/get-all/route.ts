import { protectedProcedure } from "../../../create-context";

export default protectedProcedure.query(async ({ ctx }) => {
  const { data, error } = await ctx.supabase
    .from('notifications')
    .select(`
      id,
      type,
      actor_id,
      target_plan_id,
      target_short_id,
      is_read,
      created_at,
      actor:profiles!actor_id(
        id,
        name,
        username,
        avatar
      )
    `)
    .eq('user_id', ctx.user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Error al obtener notificaciones: ${error.message}`);
  }

  return data || [];
});
