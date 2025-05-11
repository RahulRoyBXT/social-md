import { ApiError } from "../utils/ApiError.js";
import {videoFileAndThumbnailValidation} from '../validations/video.validation.js'
import { zodErrorFormatter } from "../utils/zodErrorFormatter.js";
import {DeleteLocalFile} from '../utils/DeleteUploadedFileFromLocal.js'
// File Validation middleware

export const videoRouteFileValidation = (req, res, next)=> {
    // Validating image files zod schema
    const result = videoFileAndThumbnailValidation.safeParse(req.files)
    const video = req.files?.avatar?.[0]?.path;
    const thumbnail = req.files?.coverImage?.[0].path;

    
    if(!result.success){
        DeleteLocalFile(video, thumbnail)
        return next(new ApiError(400, 'Image File validation failed', zodErrorFormatter(result)))
    }

    // Override req.files with validated data
    req.filePath = result.data
    next();
}