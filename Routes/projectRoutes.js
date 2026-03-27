import {Router} from 'express'
import project from '../controllers/project.js'

const routes = Router()
const { createProject, deleteProject } = project

routes.post('/create-project', createProject)
routes.post('/delete-project', deleteProject )


export default routes