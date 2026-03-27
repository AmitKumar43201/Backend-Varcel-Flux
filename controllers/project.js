import UserModel from '../models/user.js'
import {ECSClient, RunTaskCommand} from '@aws-sdk/client-ecs'
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { generateSlug } from "random-word-slugs"
import dotenv from 'dotenv'
dotenv.config()

const BUCKET_NAME = 'vercel-flux'

const s3Client = new S3Client({
    region: 'eu-north-1',
    credentials: {
        accessKeyId: process.env.accessKeyId,
        secretAccessKey: process.env.secretAccessKey
    }
})

const ecsClient = new ECSClient({
    region: 'eu-north-1',
    credentials: {
        accessKeyId: process.env.accessKeyId,
        secretAccessKey: process.env.secretAccessKey
    }
})

const config = {
    CLUSTER: 'arn:aws:ecs:eu-north-1:827202648322:cluster/flux-cluster02',
    TASK: 'arn:aws:ecs:eu-north-1:827202648322:task-definition/build-server-task'
}

const keys = {
    "accessKeyId" : process.env.accessKeyId,
    "secretAccessKey": process.env.secretAccessKey
}

const createProject = async (req,res) => {
    const {projectName, githubUrl, slug, email} = req.body
    let projectSlug = ''
    if (slug){
        projectSlug = slug    
    }else{
        projectSlug = generateSlug() 
    }

    const command = new RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration:{
            awsvpcConfiguration: {
                assignPublicIp: 'ENABLED',
                subnets: ['subnet-0edb4acc8a491579a','subnet-0c6884d3b086b9df7','subnet-0b00ad44a90e7ee5f'],
                securityGroups: ['sg-093e5660f19f73e04']
            }
        },
        overrides: {
            containerOverrides: [
                {
                    name: "build-server-image",
                    environment: [
                        {
                            name: "GIT_REPOSETORY_URL", value: githubUrl
                        },
                        {
                            name: "accessKeyId", value: keys.accessKeyId
                        },
                        {
                            name: "secretAccessKey", value : keys.secretAccessKey
                        },
                        {
                            name: "PROJ_ID", value: projectSlug
                        },
                        {
                            name: "Redis_Uri", value: process.env.REDIS_URI
                        },
                        {
                            name: "user_email", value: email
                        }
                    ]
                },
            ]
        }
    })

    await ecsClient.send(command)

    const user = await UserModel.findOne({ email })
    const proj_url = `http://${projectSlug}.localhost:8000`
    user.project = {
        name: projectName,
        git_url: githubUrl,
        proj_url: proj_url,
        slug: projectSlug
    }
    await user.save()

    return res.json(
        {
            status: "queued",
            project: user.project
        }
    )
}

const deleteProject = async (req, res) => {
    try {
        const { projectSlug, email } = req.body

        if (!projectSlug || !email) {
            return res.status(400).json({ message: "Missing projectSlug or email" })
        }

        const user = await UserModel.findOne({ email })

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        user.project = undefined
        await user.save()

        const listParams = {
            Bucket: BUCKET_NAME,
            Prefix: `__outputs/${projectSlug}/`
        }

        const listedObjects = await s3Client.send(
            new ListObjectsV2Command(listParams)
        )

        if (listedObjects.Contents.length > 0) {
            const deleteParams = {
                Bucket: BUCKET_NAME,
                Delete: {
                    Objects: listedObjects.Contents.map(obj => ({
                        Key: obj.Key
                    }))
                }
            }

            await s3Client.send(new DeleteObjectsCommand(deleteParams))
        }

        return res.status(200).json({
            message: "Project deleted successfully"
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Error deleting project",
            error: error.message
        })
    }
}

export default {
    createProject, deleteProject
}