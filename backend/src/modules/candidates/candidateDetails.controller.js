import asyncHandler from "../../shared/utils/asyncHandler.js";

import {
  successResponse,
} from "../../shared/response/apiResponse.js";

import {
  getCandidateFullDetails,
} from "./candidateDetails.service.js";

export const getFullDetails =
  asyncHandler(async (req, res) => {
    const data =
      await getCandidateFullDetails(
        req.params.id
      );

    return successResponse(
      res,
      data
    );
  });