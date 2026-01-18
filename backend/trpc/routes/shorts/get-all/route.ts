import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const inputSchema = z.object({
  category: z.string().optional(),
  limit: z.number().optional(),
}).optional();

export default publicProcedure
  .input(inputSchema)
  .query(async ({ ctx, input }) => {
    let query = ctx.supabase
      .from('shorts')
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
      .order('created_at', { ascending: false });

    // Apply filters if provided
    if (input?.category) {
      query = query.eq('category', input.category);
    }
    if (input?.limit) {
      query = query.limit(input.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error al obtener shorts: ${error.message}`);
    }

    return data || [];
  });