import express from "express";

import protect from "../../middleware/auth.middleware.js";

import {
  search,
} from "./search.controller.js";

const router =
  express.Router();

router.get(
  "/",
  protect,
  search
);

export default router;