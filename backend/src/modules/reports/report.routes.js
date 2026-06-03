import express from "express";

import protect from "../../middleware/auth.middleware.js";

import * as controller from "./report.controller.js";

const router =
  express.Router();

router.get(
  "/status-distribution",
  protect,
  controller.statusDistribution
);

router.get(
  "/candidate-summary",
  protect,
  controller.candidateSummary
);

router.get(
  "/hr-performance",
  protect,
  controller.hrPerformance
);

export default router;