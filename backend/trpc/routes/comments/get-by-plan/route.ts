import { z } from "zod";
import { publicProcedure } from "../../../create-context";

// Mock storage for plan comments (same as in create-plan-comment)
const mockPlanComments: any[] = [];

export default publicProcedure
  .input(z.object({ planId: z.string() }))
  .query(({ input }) => {
    return mockPlanComments.filter(comment => comment.planId === input.planId);
  });