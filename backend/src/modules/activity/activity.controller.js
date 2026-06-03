import asyncHandler from "../../shared/utils/asyncHandler.js";

import {
  successResponse,
} from "../../shared/response/apiResponse.js";

import {
  getActivityFeed,
} from "./activity.service.js";

export const activityFeed =
  asyncHandler(async (req, res) => {
    const activities =
      await getActivityFeed();

    return successResponse(
      res,
      activities
    );
  });