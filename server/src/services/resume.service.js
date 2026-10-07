import Resume from "../models/resume.model.js";
import { resumeQueue } from "../jobs/queues.js";

export async function createResumeRecord(userId, fileBuffer) {
  const resume = await Resume.create({
    userId,
    fileUrl: "stored-in-memory-pipeline", // placeholder until real file storage (S3 etc.) is added later
    status: "PENDING",
  });

  await resumeQueue.add("process-resume", {
    resumeId: resume._id.toString(),
    fileBuffer: fileBuffer.toString("base64"),
  });

  return resume;
}

export async function findResumeById(id) {
  return Resume.findById(id);
}

export async function findResumesByUser(userId) {
  return Resume.find({ userId }).sort({ createdAt: -1 });
}