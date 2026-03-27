import mongoose from 'mongoose'

const Schema = mongoose.Schema

const projectSchema = new Schema({
    name: {
       type: String,
       required: true 
    },
    slug:{
        type: String,
        required: true
    },
    git_url: {
        type: String,
        required: true
    },
    proj_url: {
        type: String,
        required: true
    },
    logs: {
        type: [String],
        required: false
    }
}, { timestamps: true })

const UserSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    project: {
        type: projectSchema,
        required: false
    }
})

const UserModel = mongoose.model('userAuth',UserSchema)

export default UserModel