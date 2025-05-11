import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validateRequest.middleware.js";
import { getAllVideosQuerySchema, ThumbnailValidation, UpdateVideoSchema } from "../validations/video.validation.js";
import { validatePublishVideo } from "../middlewares/validatePublishVideo.middleware.js";
import { videoRouteFileValidation } from "../middlewares/videoRouteFileValidation.middleware.js";
import { ImageValidator } from "../middlewares/imageFile.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/")
  .get(validateQuery(getAllVideosQuerySchema), getAllVideos)
  .post(
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    videoRouteFileValidation,
    validatePublishVideo,
    publishAVideo
  );

router
  .route("/:videoId")
  .get(getVideoById)
  // .delete(deleteVideo)

  // This is the router
  .patch(upload.single("thumbnail"),ImageValidator(ThumbnailValidation),validateBody(UpdateVideoSchema), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
