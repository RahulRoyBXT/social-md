import { ApiError } from "../utils/ApiError.js"
import { zodErrorFormatter } from "../utils/zodErrorFormatter.js"


// Query validation middleware
export const validateQuery = (schema) => (req, res, next)=>{
    // Passing the query to validate
    const result = schema.safeParse(req.query)

    if(!result.success){
        return next(new ApiError(400, 'Schema validation failed', zodErrorFormatter(result)))
    }

    next()
}


// Body validation middleware
export const validateBody =(schema) => (req, res, next)=> {
    const result = schema.safeParse(req.body)

    if(!result.success){
        return next(new ApiError(400, 'Schema validation failed', zodErrorFormatter(result)))
    }

    req.body = result.data
    next()
}


// Params validation middleware
export const validateParams =(schema) => (req, res, next)=> {
    const result = schema.safeParse(req.params)

    if(!result.success){
        return next(new ApiError(400, 'Schema validation failed', zodErrorFormatter(result)))
    }

    req.params = result.data
    next()
}
