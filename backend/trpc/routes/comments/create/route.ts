import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

const createCommentSchema = z.object({
  shortId: z.string().optional(),
  planId: z.string().optional(),
  content: z.string().min(1, "El comentario no puede estar vacío").max(500, "El comentario es demasiado largo"),
}).refine(data => data.shortId || data.planId, {
  message: "Debes proporcionar shortId o planId",
});

export default protectedProcedure
  .input(createCommentSchema)
  .mutation(async ({ ctx, input }) => {
    const { shortId, planId, content } = input;

    const insertData: any = {
      user_id: ctx.user.id,
      content,
    };

    // Add either plan_id or short_id
    if (planId) {
      insertData.plan_id = planId;
    } else if (shortId) {
      insertData.short_id = shortId;
    }

    const { data: newComment, error } = await ctx.supabase
      .from('comments')
      .insert(insertData)
      .select(`
        *,
        user:profiles!user_id(
          id,
          name,
          username,
          avatar
        )
      `)
      .single();

    if (error) {
      throw new Error(`Error al crear comentario: ${error.message}`);
    }

    return newComment;
  });