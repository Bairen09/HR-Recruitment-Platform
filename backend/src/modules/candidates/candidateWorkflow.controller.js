import asyncHandler from "../../shared/utils/asyncHandler.js";

import {
  successResponse,
} from "../../shared/response/apiResponse.js";

import * as workflowService from "./candidateWorkflow.service.js";

export const assignCandidate =
  asyncHandler(async (req, res) => {
    const candidate =
      await workflowService.assignCandidate(
        req.params.id,
        req.body.hrId,
        req.user.id
      );

    return successResponse(
      res,
      candidate,
      "Candidate assigned"
    );
  });

export const selectCandidate =
  asyncHandler(async (req, res) => {
    const candidate =
      await workflowService.selectCandidate(
        req.params.id,
        req.user.id
      );

    return successResponse(
      res,
      candidate,
      "Candidate selected"
    );
  });

export const dropCandidate =
  asyncHandler(async (req, res) => {
    const candidate =
      await workflowService.dropCandidate(
        req.params.id,
        req.body.reason,
        req.user.id
      );

    return successResponse(
      res,
      candidate,
      "Candidate dropped"
    );
  });