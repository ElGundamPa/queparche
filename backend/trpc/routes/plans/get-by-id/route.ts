import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export default publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    const { data: plan, error } = await ctx.supabase
      .from('plans')
      .select(`
        *,
        creator:profiles!user_id(
          id,
          name,
          username,
          avatar,
          is_verified
        ),
        attendees:plan_attendees(
          user:profiles(
            id,
            name,
            username,
            avatar
          )
        )
      `)
      .eq('id', input.id)
      .single();

    if (error) {
      throw new Error(`Plan no encontrado: ${error.message}`);
    }

    if (!plan) {
      throw new Error("Plan no encontrado");
    }

    return plan;
  });