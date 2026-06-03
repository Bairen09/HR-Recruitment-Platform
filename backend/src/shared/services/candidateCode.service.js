import Candidate from "../../modules/candidates/candidate.model.js";

export const generateCandidateCode = async () => {
  const year = new Date().getFullYear();

  // TODO: Replace later with counters collection (e.g. candidateCounter)
  // Note: countDocuments() is not production-safe and can generate duplicates after delete/create cycles.
  const count = await Candidate.countDocuments();

  const sequence = String(count + 1).padStart(
    4,
    "0"
  );

  return `CAN-${year}-${sequence}`;
};