import "dotenv/config";
import { Worker } from "bullmq";
import { createRequire } from "module";
import mongoose from "mongoose";
import connection from "../config/redis.js";
import Resume from "../models/resume.model.js";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

await mongoose.connect(process.env.MONGO_URI);
console.log("Worker connected to MongoDB");

console.log("Resume worker started, waiting for jobs...");

const worker = new Worker(
  "resume-processing",
  async (job) => {
    const { resumeId, fileBuffer } = job.data;

    await Resume.findByIdAndUpdate(resumeId, { status: "PROCESSING" });

    try {
      const buffer = Buffer.from(fileBuffer, "base64");
      const parser = new PDFParse({ data: buffer });
      let text;

      try {
        const result = await parser.getText();
        text = result.text;
      } finally {
        await parser.destroy();
      }

      await Resume.findByIdAndUpdate(resumeId, {
        rawText: text,
        status: "PROCESSED",
      });

      console.log(`Resume ${resumeId} processed successfully`);
    } catch (err) {
      await Resume.findByIdAndUpdate(resumeId, { status: "FAILED" });
      console.error(`Resume ${resumeId} processing failed:`, err.message);
      throw err;
    }
  },
  { connection }
);

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

export default worker;
