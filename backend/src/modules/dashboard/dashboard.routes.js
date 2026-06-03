import express from "express";

import protect from "../../middleware/auth.middleware.js";

import {
  dashboard,
} from "./dashboard.controller.js";

const router = express.Router();

router.get(
  "/",
  protect,
  dashboard
);

export default router;