import { body } from "express-validator";

export const createInterviewValidation =
  [
    body("candidateId")
      .notEmpty(),

    body("interviewerName")
      .notEmpty(),

    body("interviewType")
      .notEmpty(),

    body("scheduledAt")
      .notEmpty(),
  ];