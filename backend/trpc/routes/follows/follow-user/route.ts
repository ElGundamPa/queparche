import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export default protectedProcedure
  .input(z.object({
    followingId: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Verificar que no se esté siguiendo a sí mismo
    if (ctx.user.id === input.followingId) {
      throw new Error("No puedes seguirte a ti mismo");
    }

    // Verificar si ya sigue al usuario
    const { data: existing } = await ctx.supabase
      .from('follows')
      .select('id')
      .eq('follower_id', ctx.user.id)
      .eq('following_id', input.followingId)
      .maybeSingle();

    if (existing) {
      return { success: true, alreadyFollowing: true };
    }

    // Crear el follow
    const { error } = await ctx.supabase
      .from('follows')
      .insert({
        follower_id: ctx.user.id,
        following_id: input.followingId,
      });

    if (error) {
      throw new Error(`Error al seguir usuario: ${error.message}`);
    }

    // Crear notificación
    await ctx.supabase
      .from('notifications')
      .insert({
        user_id: input.followingId,
        type: 'follow',
        actor_id: ctx.user.id,
      });

    return { success: true, alreadyFollowing: false };
  });
