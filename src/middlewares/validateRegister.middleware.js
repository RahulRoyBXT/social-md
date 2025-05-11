import { ApiError } from '../utils/ApiError.js'
import { DeleteLocalFile } from '../utils/DeleteUploadedFileFromLocal.js';

export const validateRegisterBody = (Schema) => (req, res, next)=> {
    const result = Schema.safeParse(req.body)

    const flatPaths = Object.values(req.files || {}).flat().map(file => file.path);
    
    if(!result.success){
        flatPaths.forEach(url=>{
            DeleteLocalFile(url)
        })
        throw new ApiError(400, 'Schema Validation failed', result)
    }
    req.body = result.data
    next()
}