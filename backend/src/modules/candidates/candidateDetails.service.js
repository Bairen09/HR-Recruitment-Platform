import Candidate from "./candidate.model.js";

import CandidateProfile from "../profiles/candidateProfile.model.js";

import CandidateTimeline from "../timelines/candidateTimeline.model.js";

import CandidateAudit from "../audits/candidateAudit.model.js";

import Call from "../calls/call.model.js";

import Interview from "../interviews/interview.model.js";

import Task from "../tasks/task.model.js";

import AppError from "../../shared/errors/AppError.js";

export const getCandidateFullDetails =
  async (candidateId) => {
    const candidate =
      await Candidate.findOne({
        _id: candidateId,
        isDeleted: false,
      });

    if (!candidate) {
      throw new AppError(
        "Candidate not found",
        404
      );
    }

    const [
      profile,
      calls,
      interviews,
      tasks,
      timeline,
      audits,
    ] = await Promise.all([
      CandidateProfile.findOne({
        candidateId,
      }),

      Call.find({
        candidateId,
      }).sort({
        createdAt: -1,
      }),

      Interview.find({
        candidateId,
      }).sort({
        createdAt: -1,
      }),

      Task.find({
        candidateId,
      }).sort({
        createdAt: -1,
      }),

      CandidateTimeline.find({
        candidateId,
      }).sort({
        createdAt: -1,
      }),

      CandidateAudit.find({
        candidateId,
      }).sort({
        changedAt: -1,
      }),
    ]);

    return {
      candidate,
      profile,
      calls,
      interviews,
      tasks,
      timeline,
      audits,
    };
  };