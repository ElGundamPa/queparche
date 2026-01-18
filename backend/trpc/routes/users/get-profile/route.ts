import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export default publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ ctx, input }) => {
    const { data: profile, error } = await ctx.supabase
      .from('profiles')
      .select('*')
      .eq('id', input.userId)
      .single();

    if (error || !profile) {
      throw new Error("Usuario no encontrado");
    }

    return profile;
  });