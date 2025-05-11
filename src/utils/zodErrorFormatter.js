export const zodErrorFormatter = (errorData)=>{
    return errorData.error.errors.map(err => (
        { 
            entity: err.path.join('.'),
            message: err.message
        }
    ))
}