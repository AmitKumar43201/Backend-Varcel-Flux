import { Server } from "socket.io";
import Redis from "ioredis";
import dotenv from "dotenv";
import UserModel from "../models/user.js";

dotenv.config()
const redis_uri = process.env.REDIS_URI

const io = new Server({cors: "*"})
export function initSocket(){
    io.on('connection', socket => {
    socket.on('subscribe', channel => {
        socket.join(channel)
        socket.emit('message', `joined ${channel}`)
        })
    })

    io.listen(9001, () => {console.log(`Socket server started at Port: 9001`)})
}

const subscriber = new Redis(redis_uri)

subscriber.on('error', (err) => {
    console.error('Redis Subscriber Error:', err);
});

subscriber.on('connect', () => {
    console.log('Connected to Redis');
});

export async function initRedisSubscribe() {
    try {
        await subscriber.psubscribe('logs:*')
        subscriber.on('pmessage', async (pattern, channel, message) => {
            io.to(channel).emit('message', message)

            const email = channel.replace('logs:', '')
            try {
                await UserModel.findOneAndUpdate(
                    { email },
                    { $push: { 'project.logs': message } },
                    { new: true }
                )
            } catch (err) {
                console.error('Failed to save log to DB:', err)
            }
        })
    } catch (err) {
        console.error('Failed to subscribe to Redis channels:', err);
    }
}