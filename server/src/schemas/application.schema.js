import { z } from "zod";

export const updateStatusSchema = z.object({
  status: z.enum(["APPLIED", "REVIEWED", "INTERVIEW", "OFFER", "REJECTED"]),
});