import Task from "./task.model.js";
import { createNotification } from "../notifications/notification.service.js";

import Candidate from "../candidates/candidate.model.js";

import AppError from "../../shared/errors/AppError.js";

import { createTimelineEvent } from "../../shared/services/timeline.service.js";

import { changeCandidateStatus } from "../candidates/candidateStatus.service.js";

import {
  CANDIDATE_STATUS,
} from "../../constants/candidateStatus.js";

import {
  TIMELINE_EVENTS,
} from "../../constants/timelineEvents.js";

export const createTask =
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

    const task =
      await Task.create({
        ...payload,
        assignedBy: userId,
      });

    await changeCandidateStatus(
      payload.candidateId,
      CANDIDATE_STATUS.TASK_ASSIGNED,
      userId,
      "Task assigned"
    );

    await createTimelineEvent({
      candidateId:
        payload.candidateId,

      eventType:
        TIMELINE_EVENTS.TASK_ASSIGNED,

      title:
        "Task Assigned",

      description:
        payload.title,

      performedBy:
        userId,
    });

    await createNotification({
      userId,

      title:
        "Task Assigned",

      message:
        "Candidate task assigned",

      type:
        "TASK",
    });

    return task;
  };

export const submitTask =
  async (
    taskId,
    submissionLink,
    userId
  ) => {
    const task =
      await Task.findById(
        taskId
      );

    if (!task) {
      throw new AppError(
        "Task not found",
        404
      );
    }

    task.status =
      "SUBMITTED";

    task.submissionLink =
      submissionLink;

    await task.save();

    await changeCandidateStatus(
      task.candidateId,
      CANDIDATE_STATUS.TASK_SUBMITTED,
      userId,
      "Task submitted"
    );

    return task;
  };

export const reviewTask =
  async (
    taskId,
    payload,
    userId
  ) => {
    const task =
      await Task.findById(
        taskId
      );

    if (!task) {
      throw new AppError(
        "Task not found",
        404
      );
    }

    task.status =
      payload.passed
        ? "PASSED"
        : "FAILED";

    task.score =
      payload.score;

    task.reviewNotes =
      payload.reviewNotes;

    await task.save();

    return task;
  };