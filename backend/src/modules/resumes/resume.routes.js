import express from "express";

import protect from "../../middleware/auth.middleware.js";

import upload from "../../middleware/upload.middleware.js";

import * as controller from "./resume.controller.js";

const router =
  express.Router();

router.post(
  "/:candidateId",
  protect,
  upload.single("resume"),
  controller.uploadResume
);

export default router;