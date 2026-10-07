import { Queue } from "bullmq";
import connection from "../config/redis.js";

export const resumeQueue = new Queue("resume-processing", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});
