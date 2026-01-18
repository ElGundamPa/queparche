import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const inputSchema = z.object({
  zone: z.string().optional(),
  category: z.string().optional(),
  limit: z.number().optional(),
}).optional();

export default publicProcedure
  .input(inputSchema)
  .query(async ({ ctx, input }) => {
    let query = ctx.supabase
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
      .order('created_at', { ascending: false });

    // Apply filters if provided
    if (input?.zone) {
      query = query.eq('zone', input.zone);
    }
    if (input?.category) {
      query = query.eq('category', input.category);
    }
    if (input?.limit) {
      query = query.limit(input.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error al obtener planes: ${error.message}`);
    }

    return data || [];
  });