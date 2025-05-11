import { ApiError } from "../utils/ApiError.js";
import {Avatar_Cover_Image_Schema} from '../validations/user.validation.js'
import { zodErrorFormatter } from "../utils/zodErrorFormatter.js";
import {DeleteLocalFile} from '../utils/DeleteUploadedFileFromLocal.js'
// File Validation middleware

export const validateImageFiles = (req, res, next)=> {
    // Validating image files zod schema
    const result = Avatar_Cover_Image_Schema.safeParse(req.files)
    
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coveImageLocalPath = req.files?.coverImage?.[0].path;

    
    if(!result.success){
        DeleteLocalFile(avatarLocalPath, coveImageLocalPath)
        return next(new ApiError(400, 'Image File validation failed', zodErrorFormatter(result)))
    }

    // Override req.files with validated data
    req.files = result.data
    next();
}