import express from "express";

import protect from "../../middleware/auth.middleware.js";

import validateRequest from "../../shared/utils/validateRequest.js";

import {
  createTaskValidation,
} from "./task.validation.js";

import * as controller from "./task.controller.js";

const router =
  express.Router();

router.post(
  "/",
  protect,
  createTaskValidation,
  validateRequest,
  controller.createTask
);

router.patch(
  "/:id/submit",
  protect,
  controller.submitTask
);

router.patch(
  "/:id/review",
  protect,
  controller.reviewTask
);

export default router;