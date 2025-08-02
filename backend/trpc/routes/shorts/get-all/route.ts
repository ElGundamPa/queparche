import { publicProcedure } from "../../../create-context";
import { mockShorts } from "@/mocks/shorts";

export default publicProcedure
  .query(() => {
    return mockShorts;
  });