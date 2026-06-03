import CandidateAudit from "../../modules/audits/candidateAudit.model.js";

export const createAuditLog = async ({
  candidateId,
  fieldName,
  oldValue,
  newValue,
  changedBy,
  reason = "",
}) => {
  return CandidateAudit.create({
    candidateId,
    fieldName,
    oldValue,
    newValue,
    changedBy,
    reason,
  });
};