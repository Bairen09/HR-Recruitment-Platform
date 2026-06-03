import asyncHandler from "../../shared/utils/asyncHandler.js";

import {
  successResponse,
} from "../../shared/response/apiResponse.js";

import * as resumeService from "./resume.service.js";

export const uploadResume =
  asyncHandler(async (req, res) => {
    const resume =
      await resumeService.uploadResume(
        req.params.candidateId,
        req.file,
        req.user.id
      );

    return successResponse(
      res,
      resume,
      "Resume uploaded",
      201
    );
  });