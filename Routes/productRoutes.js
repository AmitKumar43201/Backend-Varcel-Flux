import ensureAuthenticated from '../middlewares/productAuth.js'
import prodct from '../controllers/productController.js'
import {Router} from 'express'

const routerx = Router()

routerx.get('/',ensureAuthenticated,prodct)

export default routerx