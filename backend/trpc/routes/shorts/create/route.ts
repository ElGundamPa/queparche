import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

const createShortSchema = z.object({
  video_url: z.string().url("URL de video inválida"),
  thumbnail_url: z.string().url("URL de thumbnail inválida"),
  place_name: z.string().min(3, "El nombre del lugar debe tener al menos 3 caracteres"),
  category: z.string(),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
});

export default protectedProcedure
  .input(createShortSchema)
  .mutation(async ({ ctx, input }) => {
    const { data: newShort, error } = await ctx.supabase
      .from('shorts')
      .insert({
        ...input,
        user_id: ctx.user.id,
      })
      .select(`
        *,
        creator:profiles!user_id(
          id,
          name,
          username,
          avatar,
          is_verified
        )
      `)
      .single();

    if (error) {
      throw new Error(`Error al crear short: ${error.message}`);
    }

    return newShort;
  });