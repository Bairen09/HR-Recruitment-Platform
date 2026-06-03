import mongoose from "mongoose";

const candidateProfileSchema =
  new mongoose.Schema(
    {
      candidateId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Candidate",

        required: true,
      },

      location: String,

      linkedin: String,

      github: String,

      education: Array,

      skills: Array,

      inferredSkills: Array,

      experience: Array,

      projects: Array,

      certifications: Array,
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "CandidateProfile",
  candidateProfileSchema
);