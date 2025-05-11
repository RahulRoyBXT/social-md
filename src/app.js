import express, { urlencoded} from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: '16kb'}))
app.use(urlencoded({extended: true, limit: '16kb'}))
app.use(express.static('public'))
app.use(cookieParser())


import userRoutes from './routes/user.routes.js'
import {globalErrorHandler} from './middlewares/globalErrorHandler.middleware.js'
import videoRouter from './routes/video.routes.js'
import { healthCheck } from './controllers/healthcheck.controller.js'

// All Routes Declarations
app.use('/api/v1/users', userRoutes)

app.use("/api/v1/health-check", healthCheck)
// app.use("/api/v1/tweets", tweetRouter)
// app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
// app.use("/api/v1/comments", commentRouter)
// app.use("/api/v1/likes", likeRouter)
// app.use("/api/v1/playlist", playlistRouter)
// app.use("/api/v1/dashboard", dashboardRouter)

// Global error handler
app.use(globalErrorHandler);

export {app}