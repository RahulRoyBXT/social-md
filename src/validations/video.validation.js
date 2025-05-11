import { z } from "zod";

export const getAllVideosQuerySchema = z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default("10"),
    query: z.string().optional(),
    sortBy: z.string().optional().default('createdAt'),
    sortType: z.enum(['asc','desc']).optional().default('desc'),
    userId: z.string().optional(),
})

export const publishVideoValidation = z.object({
    title: z.string().min(1 ,'Title is required'), // required field 
    description: z.string().min(1, 'Description is required')
})

// Checking video fills 

export const videoFileAndThumbnailValidation = z.object({
    videoFile : z.array(z.object({
        path: z.string({ required_error: 'File is is not available'})
    })).min(1, 'Video file is required')
    .max(1, 'Only one Video file is allowed'),
    thumbnail: z.array(z.object({
        path: z.string({ required_error: 'File is is not available'})
    })).min(1, 'Thumbnail file is required')
    .max(1, 'Only one Thumbnail file is allowed'),
})


export const ThumbnailValidation = z.object({
    path: z.string({ required_error: 'Thumbnail path is required' })
      .min(1, 'Thumbnail is required')
});
  
// Update Video Schema


export const UpdateVideoSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
})
  