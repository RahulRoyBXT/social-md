import {z} from 'zod'

export const Avatar_Cover_Image_Schema = z.object({
    avatar: z
    .array(z.object({
        path: z.string().nonempty('Avatar file path is required')
    }))
    .min(1, 'Avatar is required')
    .max(1, 'Only one avatar file is allowed'),

    coverImage: z
    .array(z.object({
        path: z.string().optional(),
    }))
    .max(1, 'Only one cover image file is allowed')
    .optional()
})


export const register_user_validation = z.object({
    email: z.string({ required_error: "Email is required"})
    .trim()
    .min(1, 'Email is required!')
    .email('Invalid email format'),

    fullName: z.string({ required_error: 'Fullname is required'})
    .trim()
    .min(1, 'Full name is required'),

    username: z.string({ required_error: 'User Name is required'})
    .trim()
    .min(1, 'Username is required'),

    password: z.string({ required_error: 'Pass is required'})
    .trim()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lower case letter')
    .regex(/[A-Z]/, 'Password must contain al least one UPPERCASE character')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?"{}|<>]/, 'Password must contain at least one special character')
})