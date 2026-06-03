import express from "express";

import * as controller from "./auth.controller.js";
import { loginValidation } from "./auth.validation.js";

import validateRequest from "../../shared/utils/validateRequest.js";
import protect from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/login",
  loginValidation,
  validateRequest,
  controller.login
);

router.post("/refresh", controller.refresh);

router.post("/logout", protect, controller.logout);

export default router;