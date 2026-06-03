import CandidateTimeline from "../timelines/candidateTimeline.model.js";

export const getActivityFeed =
  async () => {
    return CandidateTimeline.find()
      .populate(
        "performedBy",
        "name email role"
      )
      .sort({
        createdAt: -1,
      })
      .limit(100);
  };