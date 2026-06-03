import express from "express";

import {
  health,
} from "./health.controller.js";

const router =
  express.Router();

router.get(
  "/",
  health
);

export default router;