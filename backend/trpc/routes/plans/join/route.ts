import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export default protectedProcedure
  .input(z.object({
    planId: z.string(),
    action: z.enum(['join', 'leave']).default('join'),
  }))
  .mutation(async ({ ctx, input }) => {
    // Check if plan exists and has capacity
    const { data: plan, error: planError } = await ctx.supabase
      .from('plans')
      .select('id, capacity, current_attendees')
      .eq('id', input.planId)
      .single();

    if (planError || !plan) {
      throw new Error("Plan no encontrado");
    }

    if (input.action === 'join') {
      // Check capacity
      if (plan.current_attendees >= plan.capacity) {
        throw new Error("El plan está lleno");
      }

      // Check if already joined
      const { data: existing } = await ctx.supabase
        .from('plan_attendees')
        .select('id')
        .eq('plan_id', input.planId)
        .eq('user_id', ctx.user.id)
        .single();

      if (existing) {
        throw new Error("Ya estás unido a este plan");
      }

      // Join plan
      const { error: joinError } = await ctx.supabase
        .from('plan_attendees')
        .insert({
          plan_id: input.planId,
          user_id: ctx.user.id,
          status: 'confirmed',
        });

      if (joinError) {
        throw new Error(`Error al unirse al plan: ${joinError.message}`);
      }
    } else {
      // Leave plan
      const { error: leaveError } = await ctx.supabase
        .from('plan_attendees')
        .delete()
        .eq('plan_id', input.planId)
        .eq('user_id', ctx.user.id);

      if (leaveError) {
        throw new Error(`Error al salir del plan: ${leaveError.message}`);
      }
    }

    // Return updated plan
    const { data: updatedPlan } = await ctx.supabase
      .from('plans')
      .select(`
        *,
        creator:profiles!user_id(
          id,
          name,
          username,
          avatar
        )
      `)
      .eq('id', input.planId)
      .single();

    return updatedPlan;
  });