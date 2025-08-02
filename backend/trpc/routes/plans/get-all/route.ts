import { publicProcedure } from "../../../create-context";
import { mockPlans } from "@/mocks/plans";

export default publicProcedure
  .query(() => {
    return mockPlans;
  });