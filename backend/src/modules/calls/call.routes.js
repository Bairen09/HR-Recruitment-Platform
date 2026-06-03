import express from "express";

import * as controller from "./call.controller.js";

import protect from "../../middleware/auth.middleware.js";

import validateRequest from "../../shared/utils/validateRequest.js";

import {
  createCallValidation,
} from "./call.validation.js";

const router = express.Router();

router.post(
  "/",
  protect,
  createCallValidation,
  validateRequest,
  controller.createCall
);

router.get("/followups/today", protect, controller.todayFollowUps);

router.get("/followups/upcoming", protect, controller.upcomingFollowUps);

export default router;