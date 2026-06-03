import express from "express";

import protect from "../../middleware/auth.middleware.js";

import * as controller from "./candidateWorkflow.controller.js";

const router =
  express.Router();

router.patch(
  "/:id/assign",
  protect,
  controller.assignCandidate
);

router.patch(
  "/:id/select",
  protect,
  controller.selectCandidate
);

router.patch(
  "/:id/drop",
  protect,
  controller.dropCandidate
);

export default router;