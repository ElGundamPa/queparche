import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export default protectedProcedure
  .input(z.object({
    shortId: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Check if already favorited
    const { data: existingFavorite } = await ctx.supabase
      .from('favorites')
      .select('id')
      .eq('short_id', input.shortId)
      .eq('user_id', ctx.user.id)
      .maybeSingle();

    if (existingFavorite) {
      // Unfavorite
      const { error } = await ctx.supabase
        .from('favorites')
        .delete()
        .eq('short_id', input.shortId)
        .eq('user_id', ctx.user.id);

      if (error) {
        throw new Error(`Error al quitar favorito: ${error.message}`);
      }

      return { favorited: false };
    } else {
      // Favorite
      const { error } = await ctx.supabase
        .from('favorites')
        .insert({
          short_id: input.shortId,
          user_id: ctx.user.id,
        });

      if (error) {
        throw new Error(`Error al agregar favorito: ${error.message}`);
      }

      return { favorited: true };
    }
  });