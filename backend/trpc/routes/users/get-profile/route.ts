import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { mockUsers } from "@/mocks/users";

export default publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(({ input }) => {
    const user = mockUsers.find(u => u.id === input.userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  });