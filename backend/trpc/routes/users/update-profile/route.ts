import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

const updateProfileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  location: z.string().optional(),
  preferences: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
});

export default protectedProcedure
  .input(updateProfileSchema)
  .mutation(async ({ ctx, input }) => {
    // Only allow users to update their own profile
    const { data: updatedProfile, error } = await ctx.supabase
      .from('profiles')
      .update(input)
      .eq('id', ctx.user.id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error al actualizar perfil: ${error.message}`);
    }

    return updatedProfile;
  });