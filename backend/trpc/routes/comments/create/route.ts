import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { mockComments } from "@/mocks/comments";
import { mockShorts } from "@/mocks/shorts";

const createCommentSchema = z.object({
  shortId: z.string(),
  userId: z.string(),
  userName: z.string(),
  userAvatar: z.string().optional(),
  content: z.string(),
});

export default publicProcedure
  .input(createCommentSchema)
  .mutation(({ input }) => {
    const newComment = {
      id: (mockComments.length + 1).toString(),
      ...input,
      createdAt: new Date().toISOString(),
    };
    
    mockComments.push(newComment);
    
    // Update comment count on short
    const shortIndex = mockShorts.findIndex(s => s.id === input.shortId);
    if (shortIndex !== -1) {
      mockShorts[shortIndex] = {
        ...mockShorts[shortIndex],
        comments: mockShorts[shortIndex].comments + 1,
      };
    }
    
    return newComment;
  });