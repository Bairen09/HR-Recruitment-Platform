import mongoose from "mongoose";

const settingsSchema =
  new mongoose.Schema(
    {
      companyName: String,

      companyEmail: String,

      companyPhone: String,

      interviewReminderHours: {
        type: Number,
        default: 24,
      },

      followUpReminderHours: {
        type: Number,
        default: 24,
      },

      allowedResumeTypes: [
        String,
      ],

      maxResumeSizeMB: {
        type: Number,
        default: 10,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "Settings",
  settingsSchema
);