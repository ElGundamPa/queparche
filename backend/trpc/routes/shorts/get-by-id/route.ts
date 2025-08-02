import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { mockShorts } from "@/mocks/shorts";

export default publicProcedure
  .input(z.object({ id: z.string() }))
  .query(({ input }) => {
    const short = mockShorts.find(s => s.id === input.id);
    if (!short) {
      throw new Error("Short not found");
    }
    return short;
  });