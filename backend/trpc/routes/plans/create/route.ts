import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

const createPlanSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  category: z.string(),
  primary_category: z.string().optional(),
  zone: z.string(),
  city: z.string().default("Medellín"),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  capacity: z.number().positive("La capacidad debe ser mayor a 0"),
  average_price: z.number().optional(),
  price_type: z.string().optional(),
  event_date: z.string().optional(),
  images: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  vibe: z.string().optional(),
  best_time: z.string().optional(),
});

export default protectedProcedure
  .input(createPlanSchema)
  .mutation(async ({ ctx, input }) => {
    const { latitude, longitude, ...planData } = input;

    // Create PostGIS point from lat/lng
    const location = `POINT(${longitude} ${latitude})`;

    const { data: newPlan, error } = await ctx.supabase
      .from('plans')
      .insert({
        ...planData,
        user_id: ctx.user.id,
        location,
        current_attendees: 0,
      })
      .select(`
        *,
        creator:profiles!user_id(
          id,
          name,
          username,
          avatar
        )
      `)
      .single();

    if (error) {
      throw new Error(`Error al crear plan: ${error.message}`);
    }

    return newPlan;
  });