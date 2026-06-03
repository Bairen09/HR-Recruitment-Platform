import express from "express";

import protect from "../../middleware/auth.middleware.js";

import {
  getFullDetails,
} from "./candidateDetails.controller.js";

const router =
  express.Router();

router.get(
  "/:id/full",
  protect,
  getFullDetails
);

export default router;