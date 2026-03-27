import {Router} from 'express'
import { signinValidation, signupValidation } from '../middlewares/authValidation.js'
import authController from '../controllers/authController.js'


const router = Router()

router.post('/signup', signupValidation, authController.signup)

router.post('/signin', signinValidation, authController.login)

export default router