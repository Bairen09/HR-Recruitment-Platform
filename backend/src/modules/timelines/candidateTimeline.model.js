import mongoose from "mongoose";

const candidateTimelineSchema =
  new mongoose.Schema(
    {
      candidateId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Candidate",

        required: true,
      },

      eventType: String,

      title: String,

      description: String,

      metadata: Object,

      performedBy: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "CandidateTimeline",
  candidateTimelineSchema
);