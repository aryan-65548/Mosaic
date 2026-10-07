import { Queue } from "bullmq";
import connection from "../config/redis.js";

export const resumeQueue = new Queue("resume-processing", { connection });