import Candidate from "./candidate.model.js";
import CandidateProfile from "../profiles/candidateProfile.model.js";
import CandidateTimeline from "../timelines/candidateTimeline.model.js";
import CandidateAudit from "../audits/candidateAudit.model.js";

import { generateCandidateCode } from "../../shared/services/candidateCode.service.js";
import { createTimelineEvent } from "../../shared/services/timeline.service.js";
import { createAuditLog } from "../../shared/services/audit.service.js";

import { TIMELINE_EVENTS } from "../../constants/timelineEvents.js";

import { getPagination } from "../../shared/utils/pagination.js";

import AppError from "../../shared/errors/AppError.js";

export const createCandidate = async (
  payload,
  userId
) => {
  const duplicateConditions = [];

  if (payload.email) {
    duplicateConditions.push({
      email: payload.email.toLowerCase(),
    });
  }

  if (payload.phone) {
    duplicateConditions.push({
      phone: payload.phone,
    });
  }

  if (duplicateConditions.length) {
    const existingCandidate =
      await Candidate.findOne({
        $or: duplicateConditions,
        isDeleted: false,
      });

    if (existingCandidate) {
      throw new AppError(
        "Candidate already exists",
        409
      );
    }
  }

  const candidateCode =
    await generateCandidateCode();

  const candidate =
    await Candidate.create({
      ...payload,

      email: payload.email
        ? payload.email.toLowerCase()
        : undefined,

      candidateCode,

      uploadInfo: {
        uploadedBy: userId,
        uploadedAt: new Date(),
      },
    });

  await CandidateProfile.create({
    candidateId: candidate._id,
  });

  await createTimelineEvent({
    candidateId: candidate._id,

    eventType:
      TIMELINE_EVENTS.RESUME_UPLOADED,

    title: "Candidate Created",

    description:
      "Candidate record created",

    performedBy: userId,
  });

  return candidate;
};

export const getCandidates = async (
  query
) => {
  const {
    page,
    limit,
    search,
    status,
    assignedHR,
  } = query;

  const { skip, pageSize } =
    getPagination(page, limit);

  const filter = {
    isDeleted: false,
  };

  if (search) {
    filter.$or = [
      {
        fullName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
      {
        phone: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (status) {
    filter.currentStatus = status;
  }

  if (assignedHR) {
    filter.assignedHR = assignedHR;
  }

  const candidates =
    await Candidate.find(filter)
      .populate(
        "assignedHR",
        "name email"
      )
      .skip(skip)
      .limit(pageSize)
      .sort({
        createdAt: -1,
      });

  const total =
    await Candidate.countDocuments(
      filter
    );

  return {
    total,
    page: Number(page) || 1,
    limit: pageSize,
    candidates,
  };
};

export const getCandidateById = async (
  id
) => {
  const candidate =
    await Candidate.findOne({
      _id: id,
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
    timeline,
    audits,
  ] = await Promise.all([
    CandidateProfile.findOne({
      candidateId: id,
    }),

    CandidateTimeline.find({
      candidateId: id,
    }).sort({
      createdAt: -1,
    }),

    CandidateAudit.find({
      candidateId: id,
    }).sort({
      changedAt: -1,
    }),
  ]);

  return {
    candidate,

    profile: profile || null,

    timeline,

    audits,
  };
};

export const updateCandidate = async (
  id,
  payload,
  userId
) => {
  const candidate =
    await Candidate.findOne({
      _id: id,
      isDeleted: false,
    });

  if (!candidate) {
    throw new AppError(
      "Candidate not found",
      404
    );
  }

  const allowedFields = [
    "fullName",
    "email",
    "phone",
    "category",
    "assignedHR",
    "currentStatus",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (
      Object.prototype.hasOwnProperty.call(
        payload,
        field
      )
    ) {
      updates[field] =
        payload[field];
    }
  }

  if (
    updates.email
  ) {
    updates.email =
      updates.email.toLowerCase();
  }

  for (const key of Object.keys(
    updates
  )) {
    const oldValue =
      candidate[key];

    const newValue =
      updates[key];

    if (
      JSON.stringify(oldValue) !==
      JSON.stringify(newValue)
    ) {
      await createAuditLog({
        candidateId:
          candidate._id,

        fieldName: key,

        oldValue,

        newValue,

        changedBy: userId,
      });
    }
  }

  Object.assign(
    candidate,
    updates
  );

  await candidate.save();

  await createTimelineEvent({
    candidateId:
      candidate._id,

    eventType:
      TIMELINE_EVENTS.PROFILE_UPDATED,

    title:
      "Candidate Updated",

    description:
      "Candidate details updated",

    performedBy: userId,
  });

  return candidate;
};

export const softDeleteCandidate =
  async (
    id,
    userId
  ) => {
    const candidate =
      await Candidate.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!candidate) {
      throw new AppError(
        "Candidate not found",
        404
      );
    }

    candidate.isDeleted = true;

    candidate.deletedAt =
      new Date();

    candidate.deletedBy =
      userId;

    await candidate.save();

    await createTimelineEvent({
      candidateId:
        candidate._id,

      eventType:
        TIMELINE_EVENTS.DROPPED,

      title:
        "Candidate Deleted",

      description:
        "Candidate soft deleted",

      performedBy: userId,
    });

    return candidate;
  };