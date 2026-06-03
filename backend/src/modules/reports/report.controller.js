import asyncHandler from "../../shared/utils/asyncHandler.js";

import {
  successResponse,
} from "../../shared/response/apiResponse.js";

import * as reportService from "./report.service.js";

export const statusDistribution =
  asyncHandler(async (req, res) => {
    const data =
      await reportService.getStatusDistribution();

    return successResponse(
      res,
      data
    );
  });

export const candidateSummary =
  asyncHandler(async (req, res) => {
    const data =
      await reportService.getCandidateSummary();

    return successResponse(
      res,
      data
    );
  });

export const hrPerformance =
  asyncHandler(async (req, res) => {
    const data =
      await reportService.getHRPerformance();

    return successResponse(
      res,
      data
    );
  });