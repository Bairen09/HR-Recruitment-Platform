import mongoose from "mongoose";

const candidateAuditSchema =
  new mongoose.Schema(
    {
      candidateId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Candidate",

        required: true,
      },

      fieldName: String,

      oldValue:
        mongoose.Schema.Types.Mixed,

      newValue:
        mongoose.Schema.Types.Mixed,

      changedBy: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",
      },

      reason: String,

      changedAt: {
        type: Date,
        default: Date.now,
      },
    }
  );

export default mongoose.model(
  "CandidateAudit",
  candidateAuditSchema
);