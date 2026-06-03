import express from "express";

import protect from "../../middleware/auth.middleware.js";

import {
  activityFeed,
} from "./activity.controller.js";

const router =
  express.Router();

router.get(
  "/",
  protect,
  activityFeed
);

export default router;