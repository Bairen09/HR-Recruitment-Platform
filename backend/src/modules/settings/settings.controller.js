import asyncHandler from "../../shared/utils/asyncHandler.js";

import {
  successResponse,
} from "../../shared/response/apiResponse.js";

import * as settingsService from "./settings.service.js";

export const getSettings =
  asyncHandler(async (req, res) => {
    const settings =
      await settingsService.getSettings();

    return successResponse(
      res,
      settings
    );
  });

export const updateSettings =
  asyncHandler(async (req, res) => {
    const settings =
      await settingsService.updateSettings(
        req.body
      );

    return successResponse(
      res,
      settings,
      "Settings updated"
    );
  });