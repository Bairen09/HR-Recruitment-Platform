import express from "express";

const router = express.Router();

import * as controller from "./candidate.controller.js";
import protect from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/role.middleware.js";

import { ROLES } from "../../constants/roles.js";

router.get(
    "/",
    protect,
    controller.getCandidates
);

router.get(
    "/:id",
    protect,
    controller.getCandidate
);

router.post(
    "/",
    protect,
    authorize(
        ROLES.ADMIN
    ),
    controller.createCandidate
);

router.patch(
    "/:id",
    protect,
    authorize(
        ROLES.ADMIN,
        ROLES.HR
    ),
    controller.updateCandidate
);

router.delete(
    "/:id",
    protect,
    authorize(
        ROLES.ADMIN
    ),
    controller.deleteCandidate
);

export default router;