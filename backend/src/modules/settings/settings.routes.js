import express from "express";

import protect from "../../middleware/auth.middleware.js";

import authorize from "../../middleware/role.middleware.js";

import { ROLES } from "../../constants/roles.js";

import * as controller from "./settings.controller.js";

const router =
  express.Router();

router.get(
  "/",
  protect,
  controller.getSettings
);

router.patch(
  "/",
  protect,
  authorize(
    ROLES.ADMIN
  ),
  controller.updateSettings
);

export default router;