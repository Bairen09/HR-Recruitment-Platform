import { body } from "express-validator";

export const createTaskValidation = [
  body("candidateId")
    .notEmpty(),

  body("title")
    .notEmpty(),
];