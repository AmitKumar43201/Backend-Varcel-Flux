import express from 'express'
import http from 'http'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { connectDB } from './models/db.js'
import router from './Routes/authRouter.js'
import routes from './Routes/projectRoutes.js'
import dotenv from 'dotenv'
dotenv.config()

import { initSocket, initRedisSubscribe } from './socketio/socketio.js'

const PORT = process.env.PORT || 9000
const app = express()
const server = http.createServer(app)
connectDB()

app.use(express.json())
app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors({
  origin: true,
  credentials: true,
}))
app.use('/auth',router)
app.use('/project', routes)

initSocket(server)
await initRedisSubscribe()



server.listen(PORT)