import asyncHandler from "../../shared/utils/asyncHandler.js";

import {
  successResponse,
} from "../../shared/response/apiResponse.js";

import {
  getDashboardData,
} from "./dashboard.service.js";

export const dashboard =
  asyncHandler(async (req, res) => {
    const data =
      await getDashboardData();

    return successResponse(
      res,
      data
    );
  });