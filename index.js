import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { connectDB } from './models/db.js'
import router from './Routes/authRouter.js'
import routes from './Routes/projectRoutes.js'
import dotenv from 'dotenv'
dotenv.config()

import { initSocket, initRedisSubscribe } from './socketio/socketio.js'

const PORT = 9000
const app = express()
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

initSocket()
await initRedisSubscribe()



app.listen(PORT, () => {console.log(`Api-Server started at http://localhost:${PORT}`)})