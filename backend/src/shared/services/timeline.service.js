import CandidateTimeline from "../../modules/timelines/candidateTimeline.model.js";

export const createTimelineEvent = async ({
  candidateId,
  eventType,
  title,
  description,
  metadata = {},
  performedBy,
}) => {
  return CandidateTimeline.create({
    candidateId,
    eventType,
    title,
    description,
    metadata,
    performedBy,
  });
};