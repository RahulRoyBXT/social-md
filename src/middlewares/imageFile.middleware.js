import { ApiError } from "../utils/ApiError.js";
import { DeleteLocalFile } from "../utils/DeleteUploadedFileFromLocal.js";

export const ImageValidator = (schema) => (req, res, next) => {
  const files = req.files || req.file;
  const result = schema.safeParse(files);
  if (!result.success) {
    DeleteLocalFile(req.file?.path);
    throw new ApiError(400, "Image validation is failed", result);
  }

  req.file = result.data;
  next();
};
