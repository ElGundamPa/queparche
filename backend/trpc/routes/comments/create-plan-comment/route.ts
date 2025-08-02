import { z } from "zod";
import { publicProcedure } from "../../../create-context";

// Mock storage for plan comments
const mockPlanComments: any[] = [];

const createPlanCommentSchema = z.object({
  planId: z.string(),
  userId: z.string(),
  userName: z.string(),
  userAvatar: z.string().optional(),
  content: z.string(),
});

export default publicProcedure
  .input(createPlanCommentSchema)
  .mutation(({ input }) => {
    const newComment = {
      id: (mockPlanComments.length + 1).toString(),
      ...input,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    
    mockPlanComments.push(newComment);
    return newComment;
  });