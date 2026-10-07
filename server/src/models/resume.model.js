import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  rawText: { type: String, default: "" },
  fileUrl: { type: String, required: true },
  parsed: {
    experience: { type: [String], default: [] },
    education: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    summary: { type: String, default: "" },
  },
  status: {
    type: String,
    enum: ["PENDING", "PROCESSING", "PROCESSED", "FAILED"],
    default: "PENDING",
  },
  parsedByLlmAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model("Resume", resumeSchema);