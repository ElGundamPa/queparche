import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { mockComments } from "@/mocks/comments";

export default publicProcedure
  .input(z.object({ shortId: z.string() }))
  .query(({ input }) => {
    return mockComments.filter(comment => comment.shortId === input.shortId);
  });