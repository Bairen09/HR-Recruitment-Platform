import mongoose from "mongoose";

import {
  STATUS_VALUES,
} from "../../constants/candidateStatus.js";

const candidateSchema =
  new mongoose.Schema(
    {
      candidateCode: {
        type: String,
        unique: true,
        required: true,
      },

      fullName: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        lowercase: true,
      },

      phone: String,

      category: {
        type: String,
        required: true,
      },

      source: {
        type: String,
        default: "MANUAL",
      },

      assignedHR: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",
      },

      currentStatus: {
        type: String,

        enum: STATUS_VALUES,

        default: "NEW",
      },

      uploadInfo: {
        uploadedBy: {
          type:
            mongoose.Schema.Types.ObjectId,

          ref: "User",
        },

        uploadedAt: Date,
      },

      droppedInfo: {
        reason: String,

        note: String,

        droppedBy: {
          type:
            mongoose.Schema.Types.ObjectId,

          ref: "User",
        },

        droppedAt: Date,
      },

      selectedInfo: {
        joiningDate: Date,

        package: Number,

        notes: String,
      },

      isDeleted: {
        type: Boolean,
        default: false,
      },

      deletedAt: Date,

      deletedBy: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",
      },
    },
    {
      timestamps: true,
    }
  );

candidateSchema.index({
  email: 1,
});

candidateSchema.index({
  phone: 1,
});

candidateSchema.index({
  assignedHR: 1,
});

candidateSchema.index({
  currentStatus: 1,
});

export default mongoose.model(
  "Candidate",
  candidateSchema
);