import { ApiError } from "../utils/ApiError.js";
import { publishVideoValidation } from "../validations/video.validation.js";

export const validatePublishVideo = (req, res, next) => {
  try {
    // validate the title and descriptions
    publishVideoValidation.safeParse(req.body);

    // More fields can be added in the future
    const requiredFields = ["videoFile", "thumbnail"];

    // validate all fields
    for (const field of requiredFields) {
      const file = req.files?.[field]?.[0];

      if (!file) {
        throw new ApiError(400, `${field} file is required`);
      }

      if (field === "thumbnail") {
        if (!["image/jpeg", "image/jpg", "image/png"].includes(file.mimetype)) {
          throw new ApiError(400, "Thumbnail must be JPEG, JPG or PNG format");
        }
      }
      if (field === "videoFile") {
        if (file.mimetype !== "video/mp4") {
          throw new ApiError(400, "Only MP4 Videos are allowed");
        }
      }

      // Validating file size
      if (field === "thumbnail" && file.size > 20 * 1024 * 1024) {
        throw new ApiError(400, " Thumbnail size should be under 20mb");
      }
      if (field === "videoFile" && file.size > 100 * 1024 * 1024) {
        throw new ApiError(400, " Video size should be under 100mb");
      }
    }
    const paths = (Object.values(req.files).flat().map(file => file.path))
    req.filePath = paths
    // Validated and passed
    next();
  } catch (error) {
    // zod errors
    // Checking the error name
    if (error.name === "ZodError") {
      const message = error.errors?.[0]?.message || "Invalid request";
      next(new ApiError(400, message));
    } else {
      next(error);
    }
  }
};
