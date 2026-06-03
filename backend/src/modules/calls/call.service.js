import Call from "./call.model.js";
import { createNotification } from "../notifications/notification.service.js";

import Candidate from "../candidates/candidate.model.js";

import AppError from "../../shared/errors/AppError.js";

import { createTimelineEvent } from "../../shared/services/timeline.service.js";

import { TIMELINE_EVENTS } from "../../constants/timelineEvents.js";

import { CALL_OUTCOMES } from "../../constants/callOutcomes.js";

import { INTEREST_STATUS } from "../../constants/interestStatus.js";

import { CANDIDATE_STATUS } from "../../constants/candidateStatus.js";

import { changeCandidateStatus } from "../candidates/candidateStatus.service.js";

export const createCall =
  async (
    payload,
    userId
  ) => {
    const candidate =
      await Candidate.findById(
        payload.candidateId
      );

    if (!candidate) {
      throw new AppError(
        "Candidate not found",
        404
      );
    }

    const previousCalls =
      await Call.countDocuments({
        candidateId:
          payload.candidateId,
      });

    const attemptNumber =
      previousCalls + 1;

    const call =
      await Call.create({
        ...payload,

        attemptNumber,

        createdBy: userId,
      });

    await createTimelineEvent({
      candidateId:
        payload.candidateId,

      eventType:
        TIMELINE_EVENTS.CALL_LOGGED,

      title:
        "Call Logged",

      description: payload.note,

      performedBy: userId,
    });

    if (
      payload.interestStatus ===
      INTEREST_STATUS.INTERESTED
    ) {
      await changeCandidateStatus(
        payload.candidateId,

        CANDIDATE_STATUS.CONTACTED,

        userId,

        "Candidate interested"
      );
    }

    if (
      payload.interestStatus ===
      INTEREST_STATUS.NEEDS_FOLLOW_UP
    ) {
      await changeCandidateStatus(
        payload.candidateId,

        CANDIDATE_STATUS.FOLLOW_UP,

        userId,

        "Follow up required"
      );

      await createNotification({
        userId,

        title:
          "Follow-up Required",

        message:
          "Candidate requires follow-up",

        type:
          "FOLLOW_UP",
      });
    }

    if (
      payload.outcome ===
        CALL_OUTCOMES.NOT_PICKED &&
      attemptNumber >= 3
    ) {
      await changeCandidateStatus(
        payload.candidateId,

        CANDIDATE_STATUS.DROPPED,

        userId,

        "Three unsuccessful call attempts"
      );
    }

    return call;
  };

export const getTodayFollowUps = async () => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  return Call.find({
    followUpDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  }).populate("candidateId");
};

export const getUpcomingFollowUps = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return Call.find({
    followUpDate: {
      $gte: tomorrow,
    },
  })
    .populate("candidateId")
    .sort({ followUpDate: 1 });
};