import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { mockPlans } from "@/mocks/plans";

export default publicProcedure
  .input(z.object({ id: z.string() }))
  .query(({ input }) => {
    const plan = mockPlans.find(p => p.id === input.id);
    if (!plan) {
      throw new Error("Plan not found");
    }
    return plan;
  });