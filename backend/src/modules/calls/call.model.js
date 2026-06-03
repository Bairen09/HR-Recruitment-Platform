import mongoose from "mongoose";

import {
  CALL_OUTCOME_VALUES,
} from "../../constants/callOutcomes.js";

import {
  INTEREST_STATUS_VALUES,
} from "../../constants/interestStatus.js";

const callSchema =
  new mongoose.Schema(
    {
      candidateId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Candidate",

        required: true,
      },

      attemptNumber: {
        type: Number,

        required: true,
      },

      outcome: {
        type: String,

        enum:
          CALL_OUTCOME_VALUES,

        required: true,
      },

      interestStatus: {
        type: String,

        enum:
          INTEREST_STATUS_VALUES,
      },

      note: {
        type: String,

        required: true,
      },

      followUpDate: Date,

      createdBy: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",
      },
    },
    {
      timestamps: true,
    }
  );

callSchema.index({
  candidateId: 1,
});

callSchema.index({
  followUpDate: 1,
});

export default mongoose.model(
  "Call",
  callSchema
);